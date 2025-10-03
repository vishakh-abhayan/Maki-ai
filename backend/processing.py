import contextlib
import datetime
import json
import subprocess
import wave
import torch
import numpy as np

from groq import Groq
from pyannote.audio import Audio
from pyannote.core import Segment
from pyannote.audio.pipelines.speaker_verification import PretrainedSpeakerEmbedding
from sklearn.cluster import AgglomerativeClustering

# Initialize models and clients globally to load them only once
print("Loading speaker embedding model...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
embedding_model = PretrainedSpeakerEmbedding(
    "speechbrain/spkrec-ecapa-voxceleb",
    device=device
)
print("Speaker embedding model loaded.")

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


def transcribe_with_groq(client: Groq, audio_path: str):
    """Transcribes the audio file using the Groq API and returns segments."""
    print("Transcribing with Groq... (This will be fast!)")
    with open(audio_path, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=(audio_path, file.read()),
            model="whisper-large-v3",
            response_format="verbose_json",
            language="en"
        )
    return transcription.model_dump()["segments"]

def perform_diarization(segments, audio_path, num_speakers):
    """Performs speaker diarization on the transcribed segments."""
    try:
        # Get audio duration
        with contextlib.closing(wave.open(audio_path, 'r')) as f:
            frames = f.getnframes()
            rate = f.getframerate()
            duration = frames / float(rate)

        # Function to get embeddings for each segment
        audio_processor = Audio()
        def segment_embedding(segment):
            start = segment["start"]
            end = min(duration, segment["end"])
            clip = Segment(start, end)
            waveform, _ = audio_processor.crop(audio_path, clip)
            return embedding_model(waveform[None])

        # Get embeddings for each segment
        print("Generating speaker embeddings (local)...")
        embeddings = np.zeros(shape=(len(segments), 192))
        for i, segment in enumerate(segments):
            embeddings[i] = segment_embedding(segment)
        embeddings = np.nan_to_num(embeddings)

        # Clustering to identify speakers
        print(f"Clustering embeddings for {num_speakers} speakers...")
        clustering = AgglomerativeClustering(num_speakers).fit(embeddings)
        labels = clustering.labels_
        for i in range(len(segments)):
            segments[i]["speaker"] = 'SPEAKER ' + str(labels[i] + 1)
        
        return segments

    except Exception as e:
        print(f"An error occurred during diarization: {e}")
        # Return segments without speaker info if diarization fails
        for seg in segments:
            seg["speaker"] = "DIARIZATION_FAILED"
        return segments

def format_transcript(segments):
    """Formats the final transcript string with speaker labels and timestamps."""
    def format_time(secs):
        return str(datetime.timedelta(seconds=round(secs)))

    transcript_lines = []
    current_speaker = None
    for i, segment in enumerate(segments):
        speaker = segment.get("speaker", "UNKNOWN_SPEAKER")
        
        if speaker != current_speaker:
            if transcript_lines: 
                transcript_lines.append("\n\n")
            transcript_lines.append(f"**{speaker}** [{format_time(segment['start'])}]\n")
            current_speaker = speaker
        
        transcript_lines.append(segment["text"].strip())
    
    return " ".join(transcript_lines)

def extract_insights_with_groq(client: Groq, transcript: str):
    """
    Enhanced version that extracts action items, key information, and reminders
    """
    print("Extracting insights and reminders with Groq LLM...")
    
    system_prompt = """
    You are an expert meeting summarization assistant. Analyze the transcript and extract:
    1. Action items for each speaker
    2. Key information shared
    3. Reminders with specific dates/times
    
    Identify speakers' actual names when mentioned. Extract any time-sensitive reminders with:
    - Title/description of the reminder
    - Who it's from (speaker name or context)
    - When it needs to happen (specific date/time if mentioned)
    - Priority level (high/normal/low based on urgency or importance mentioned)
    - Category (meeting, call, task, deadline, personal)

    Return a single valid JSON object with this structure:
    {
      "speakers": {
        "Speaker_Name_or_Number": {
          "action_items": ["list of action items"],
          "key_information": ["list of key points"]
        }
      },
      "reminders": [
        {
          "title": "Reminder description",
          "from": "Source/speaker",
          "datetime": "ISO format datetime or descriptive time",
          "time_text": "Human readable time (e.g., 'Tomorrow at 2 PM')",
          "priority": "high/normal/low",
          "category": "meeting/call/task/deadline/personal",
          "extracted_from": "Original text that mentioned this reminder"
        }
      ]
    }
    
    Parse any time references like:
    - "tomorrow at 2 PM" 
    - "next Monday"
    - "by end of week"
    - "Friday at 3:30"
    - "in two hours"
    
    Always return valid JSON only, no additional text.
    """
    
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcript}
        ],
        model="openai/gpt-oss-120b",
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    
    response_text = chat_completion.choices[0].message.content
    print("Insights and reminders received from Groq.")
    
    insights = json.loads(response_text)
    
    # Post-process reminders to add parsed datetime if possible
    if "reminders" in insights:
        from dateutil import parser
        from datetime import datetime, timedelta
        import re
        
        for reminder in insights["reminders"]:
            try:
                # Try to parse datetime from the time_text
                parsed_datetime = parse_relative_time(reminder.get("time_text", ""))
                if parsed_datetime:
                    reminder["datetime"] = parsed_datetime.isoformat()
                    reminder["timestamp"] = parsed_datetime.timestamp()
            except:
                # If parsing fails, keep the original text
                reminder["timestamp"] = None
    
    return insights

def parse_relative_time(time_text):
    """
    Helper function to parse relative time expressions
    """
    from datetime import datetime, timedelta
    import re
    
    now = datetime.now()
    time_text_lower = time_text.lower()
    
    # Handle common patterns
    if "tomorrow" in time_text_lower:
        base = now + timedelta(days=1)
        # Extract time if mentioned
        time_match = re.search(r'(\d{1,2}):?(\d{2})?\s*(am|pm|p\.m\.|a\.m\.)?', time_text_lower)
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2)) if time_match.group(2) else 0
            meridiem = time_match.group(3)
            if meridiem and 'p' in meridiem and hour < 12:
                hour += 12
            return base.replace(hour=hour, minute=minute, second=0, microsecond=0)
        return base
    
    elif "today" in time_text_lower:
    
        time_match = re.search(r'(\d{1,2}):?(\d{2})?\s*(am|pm|p\.m\.|a\.m\.)?', time_text_lower)
        if time_match:
            hour = int(time_match.group(1))
            minute = int(time_match.group(2)) if time_match.group(2) else 0
            meridiem = time_match.group(3)
            if meridiem and 'p' in meridiem and hour < 12:
                hour += 12
            return now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        return now
    
    
    return None