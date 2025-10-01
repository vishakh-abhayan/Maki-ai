import os
import tempfile
import shutil
import uuid
import json
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pymongo import MongoClient
from groq import Groq
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the processing functions from our other file
from processing import (
    convert_audio_to_wav,
    transcribe_with_groq,
    perform_diarization,
    format_transcript,
    extract_insights_with_groq
)

# Initialize the FastAPI app
app = FastAPI(
    title="Audio Transcription and Diarization API",
    description="Upload an audio file, get a transcript with speaker labels, action items, and key information."
)

# --- MongoDB Connection ---
try:
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
    mongo_client = MongoClient(mongodb_url)
    db = mongo_client["transcription_db"]
    transcripts_collection = db["transcripts"]
    print(f"Successfully connected to MongoDB at {mongodb_url}")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    mongo_client = None

# --- Groq Client Initialization ---
try:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables. Please add it to .env file.")
    client = Groq(api_key=groq_api_key)
    print("Successfully initialized Groq client.")
except Exception as e:
    print(f"Failed to initialize Groq client: {e}")
    client = None

@app.post("/transcribe/")
async def transcribe_audio(
    file: UploadFile = File(..., description="The audio file to transcribe."),
    num_speakers: int = Form(default=2, description="The number of speakers in the audio.")
):
    """
    This endpoint receives an audio file, processes it, returns the transcript 
    with speaker-separated insights, and stores it in the database.
    """
    if not client:
        raise HTTPException(status_code=500, detail="Groq client not initialized. Check API key.")

    # Use a temporary directory to handle file operations securely
    with tempfile.TemporaryDirectory() as temp_dir:
        # Save the uploaded file temporarily
        input_audio_path = os.path.join(temp_dir, file.filename)
        with open(input_audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Define path for the converted WAV file
        converted_audio_path = os.path.join(temp_dir, "audio.wav")

        # 1. Convert the audio to the required WAV format
        if not convert_audio_to_wav(input_audio_path, converted_audio_path):
            raise HTTPException(status_code=500, detail="Failed to convert audio file. Ensure ffmpeg is installed.")

        # 2. Transcribe using Groq
        try:
            segments = transcribe_with_groq(client, converted_audio_path)
            if not segments:
                raise HTTPException(status_code=500, detail="Transcription failed to return segments.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred during transcription: {e}")

        # 3. Perform Speaker Diarization
        diarized_segments = perform_diarization(segments, converted_audio_path, num_speakers)

        # 4. Format the final transcript
        final_transcript = format_transcript(diarized_segments)
        
        # 5. Extract Action Items and Key Information
        try:
            insights = extract_insights_with_groq(client, final_transcript)
        except json.JSONDecodeError:
            print("Warning: Failed to parse JSON from insights model. Storing raw text.")
            insights = {"error": "Failed to parse insights from the model."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred during insight extraction: {e}")

        # 6. Store the result in MongoDB
        if mongo_client:
            try:
                transcript_record = {
                    "_id": str(uuid.uuid4()),
                    "filename": file.filename,
                    "num_speakers": num_speakers,
                    "transcript": final_transcript,
                    "insights": insights,
                    "timestamp": datetime.utcnow()
                }
                transcripts_collection.insert_one(transcript_record)
                print(f"Transcript and insights for {file.filename} saved to MongoDB.")
            except Exception as e:
                # Log the error, but don't fail the request if DB fails
                print(f"Error saving transcript to MongoDB: {e}")
        else:
            print("MongoDB client not available. Skipping database save.")

        return {"transcript": final_transcript, "insights": insights}

@app.get("/transcripts/")
async def get_all_transcripts():
    """
    Retrieves all stored transcripts from the MongoDB database.
    """
    if not mongo_client:
        raise HTTPException(status_code=500, detail="MongoDB client not initialized.")
    
    try:
        # Find all documents, exclude the default _id and convert ObjectId to str for JSON serialization
        all_transcripts = list(transcripts_collection.find())
        for doc in all_transcripts:
            doc['_id'] = str(doc['_id'])
        return all_transcripts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve transcripts: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Transcription and Diarization API. Please use the /docs endpoint to test."}

if __name__ == "__main__":
    # For production, use a proper ASGI server like Gunicorn with Uvicorn workers
    uvicorn.run(app, host="0.0.0.0", port=8000)