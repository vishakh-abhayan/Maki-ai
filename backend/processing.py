import datetime
import json
import subprocess
from datetime import datetime as dt, timedelta
import re

from groq import Groq

# --- Helper Functions ---

def convert_audio_to_wav(input_path, output_path):
    """Converts the input audio file to 16kHz mono WAV format using ffmpeg."""
    print(f"Converting {input_path} to WAV format...")
    try:
        subprocess.run([
            'ffmpeg', '-i', input_path, '-ar', '16000', '-ac', '1', 
            '-c:a', 'pcm_s16le', output_path, '-y'
        ], check=True, capture_output=True, text=True)
        print("Conversion successful.")
        return True
    except FileNotFoundError:
        print("Error: ffmpeg is not installed or not in the system's PATH.")
        return False
    except subprocess.CalledProcessError as e:
        print(f"Error: ffmpeg failed. Details: {e.stderr}")
        return False

def transcribe_with_groq(client: Groq, audio_path: str, num_speakers: int = 2):
    """Transcribes the audio file using the Groq API and assigns speakers."""
    print("Transcribing with Groq... (This will be fast!)")
    with open(audio_path, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=(audio_path, file.read()),
            model="whisper-large-v3",
            response_format="verbose_json",
            language="en"
        )
    
    segments = transcription.model_dump()["segments"]
    
    # Assign speakers directly here (round-robin)
    print(f"Assigning {num_speakers} speakers to segments...")
    for i, segment in enumerate(segments):
        speaker_id = (i % num_speakers) + 1
        segment["speaker"] = f'SPEAKER {speaker_id}'
    
    return segments

def format_transcript(segments):
    """Formats the final transcript string with speaker labels and timestamps."""
    transcript = ""
    current_speaker = None
    
    for segment in segments:
        speaker = segment.get("speaker", "Unknown")
        start_time = str(datetime.timedelta(seconds=int(segment["start"])))
        end_time = str(datetime.timedelta(seconds=int(segment["end"])))
        text = segment["text"].strip()
        
        if speaker != current_speaker:
            transcript += f"\n[{start_time} - {end_time}] {speaker}:\n"
            current_speaker = speaker
        
        transcript += f"{text} "
    
    return transcript.strip()

def parse_datetime_from_text(time_text):
    """
    Parse natural language time expressions into datetime
    Returns None if no date/time can be parsed
    """
    if not time_text:
        return None
    
    now = dt.now()
    time_text_lower = time_text.lower().strip()
    
    # Common patterns
    patterns = {
        'tomorrow': now + timedelta(days=1),
        'today': now,
        'next week': now + timedelta(weeks=1),
        'next month': now + timedelta(days=30),
        'end of week': now + timedelta(days=(4 - now.weekday())),  # Friday
        'end of day': now.replace(hour=17, minute=0, second=0),
    }
    
    # Check for exact matches
    for pattern, base_date in patterns.items():
        if pattern in time_text_lower:
            # Try to extract specific time
            time_match = re.search(r'(\d{1,2}):?(\d{2})?\s*(am|pm|p\.m\.|a\.m\.)?', time_text_lower)
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2)) if time_match.group(2) else 0
                meridiem = time_match.group(3)
                
                if meridiem and 'p' in meridiem and hour < 12:
                    hour += 12
                elif meridiem and 'a' in meridiem and hour == 12:
                    hour = 0
                    
                try:
                    return base_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                except:
                    pass
            return base_date
    
    # Try to parse specific days
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for i, day in enumerate(days):
        if day in time_text_lower:
            days_ahead = (i - now.weekday()) % 7
            if days_ahead == 0:  # Same day, assume next week
                days_ahead = 7
            target_date = now + timedelta(days=days_ahead)
            
            # Extract time if present
            time_match = re.search(r'(\d{1,2}):?(\d{2})?\s*(am|pm)?', time_text_lower)
            if time_match:
                hour = int(time_match.group(1))
                minute = int(time_match.group(2)) if time_match.group(2) else 0
                meridiem = time_match.group(3)
                
                if meridiem and 'p' in meridiem and hour < 12:
                    hour += 12
                    
                return target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            return target_date
    
    # Try "in X hours/days"
    in_duration = re.search(r'in\s+(\d+)\s+(hour|day|week)s?', time_text_lower)
    if in_duration:
        amount = int(in_duration.group(1))
        unit = in_duration.group(2)
        if unit == 'hour':
            return now + timedelta(hours=amount)
        elif unit == 'day':
            return now + timedelta(days=amount)
        elif unit == 'week':
            return now + timedelta(weeks=amount)
    
    return None

def extract_insights_with_groq(client: Groq, transcript: str):
    """
    Extract action items, key information, and reminders with proper due date handling
    """
    print("Extracting insights and reminders with Groq LLM...")
    
    prompt = f"""Analyze the following transcript and extract insights.
    
    Transcript:
    {transcript}
    
    Extract the following information:
    1. Action items for each speaker
    2. Key information shared by each speaker
    3. Any reminders or time-sensitive tasks mentioned
    
    For reminders, extract:
    - title: Brief description of what needs to be done
    - from: Which speaker mentioned it
    - due_date_text: EXACTLY what was said about when (e.g., "tomorrow at 2pm", "next Friday", "by end of week")
      If NO specific time/date is mentioned, set this to null
    - priority: "high", "normal", or "low" based on urgency
    - category: "meeting", "call", "task", "deadline", or "personal"
    - extracted_from: The exact phrase from the transcript
    
    Return ONLY a valid JSON object with this exact structure:
    {{
        "speakers": {{
            "SPEAKER 1": {{
                "action_items": ["list of action items"],
                "key_information": ["list of key points"]
            }},
            "SPEAKER 2": {{
                "action_items": ["list of action items"],
                "key_information": ["list of key points"]
            }}
        }},
        "reminders": [
            {{
                "title": "string",
                "from": "string",
                "due_date_text": "string or null if no date mentioned",
                "priority": "high/normal/low",
                "category": "meeting/call/task/deadline/personal",
                "extracted_from": "original text"
            }}
        ]
    }}
    
    Important: Only include reminders that have clear action items. 
    Set due_date_text to null if no specific time is mentioned.
    """
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    insights = json.loads(response.choices[0].message.content)
    
    # Post-process reminders to add parsed due_date
    if "reminders" in insights and insights["reminders"]:
        for reminder in insights["reminders"]:
            # Parse the due_date_text if it exists
            due_date_text = reminder.get("due_date_text")
            
            if due_date_text:
                parsed_date = parse_datetime_from_text(due_date_text)
                if parsed_date:
                    reminder["due_date"] = parsed_date.isoformat()
                else:
                    reminder["due_date"] = None
            else:
                reminder["due_date"] = None
                reminder["due_date_text"] = None
    
    return insights