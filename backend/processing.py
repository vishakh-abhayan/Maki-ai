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
    Uses a Groq chat model to extract action items and key information 
    for each speaker from a transcript. It also attempts to identify speaker names.
    """
    print("Extracting insights with Groq LLM...")
    
    system_prompt = """
    You are an expert meeting summarization assistant. Your task is to analyze a meeting transcript and extract a) specific action items and b) key information for each speaker. The speakers are labeled as '**SPEAKER 1**', '**SPEAKER 2**', etc.

    Your primary goal is to identify the actual names of the speakers from the conversation. If speakers address each other by name, use their name as the key in the output JSON. If a speaker's name cannot be determined, use their original label (e.g., 'SPEAKER 1') as the key.

    Your output MUST be a single, valid JSON object. Do not add any text, notes, or explanations outside of this JSON object.

    The JSON object should have a key for each speaker.
    - For each speaker, the value should be another JSON object with two keys: "action_items" and "key_information".
    - "action_items" must be an array of strings. Each string is a clear, concise task assigned to or mentioned by that speaker. If a speaker has no action items, provide an empty array [].
    - "key_information" must be an array of strings. Each string is a significant point, decision, or piece of information contributed by that speaker. If a speaker has no key information, provide an empty array [].
    
    Example for a transcript where one speaker's name (Jane) is identified:
    {
      "Jane": {
        "action_items": ["Follow up with the design team on the new mockups."],
        "key_information": ["Reported that Q3 sales are up by 15%.", "Confirmed the budget for the new project is approved."]
      },
      "SPEAKER 2": {
        "action_items": [],
        "key_information": ["Raised a concern about the project timeline."]
      }
    }
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
    print("Insights received from Groq.")
    return json.loads(response_text)

