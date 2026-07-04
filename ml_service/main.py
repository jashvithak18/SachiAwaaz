import os
import tempfile
import numpy as np
import torch
import soundfile as sf
import torchaudio.transforms as T
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from speechbrain.inference.speaker import EncoderClassifier
from speechbrain.utils.fetching import LocalStrategy

app = FastAPI(title="VeriVoice ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
encoder = None
deepfake_pipe = None

print("Loading models... This may take a moment.")
try:
    # Load SpeechBrain ECAPA-TDNN model with local copy strategy (avoids Windows symlink issue)
    encoder = EncoderClassifier.from_hparams(
        source="speechbrain/spkrec-ecapa-voxceleb",
        savedir="pretrained_models/spkrec-ecapa-voxceleb",
        local_strategy=LocalStrategy.COPY
    )
    print("Speaker verification model loaded successfully.")

    # Load deepfake detection model
    deepfake_pipe = pipeline("audio-classification", model="mo-thecreator/Deepfake-audio-detection")
    print("Deepfake detection model loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")

def preprocess_audio(file_path: str) -> torch.Tensor:
    """Load audio file using soundfile, convert to mono, resample to 16kHz, and return as torch tensor."""
    data, sr = sf.read(file_path)
    signal = torch.tensor(data, dtype=torch.float32)
    
    # If mono (1D), convert to (1, time)
    if len(signal.shape) == 1:
        signal = signal.unsqueeze(0)
    # If multi-channel (time, channels), transpose to (channels, time) and average to mono
    elif len(signal.shape) == 2:
        signal = signal.T
        signal = torch.mean(signal, dim=0, keepdim=True)
    
    # Resample to 16000 if sample rate is different
    if sr != 16000:
        resampler = T.Resample(orig_freq=sr, new_freq=16000)
        signal = resampler(signal)
        
    return signal

@app.post("/embed")
async def generate_embedding(file: UploadFile = File(...)):
    if not encoder:
        raise HTTPException(status_code=500, detail="Speaker verification model not loaded.")
    
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        signal_tensor = preprocess_audio(temp_path)
        with torch.no_grad():
            embeddings = encoder.encode_batch(signal_tensor)
            embedding_list = embeddings[0, 0].cpu().tolist()
        
        return {"embedding": embedding_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process audio: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/detect")
async def detect_deepfake(file: UploadFile = File(...)):
    if not deepfake_pipe:
        raise HTTPException(status_code=500, detail="Deepfake detection model not loaded.")
    
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        # Load and preprocess to get 16kHz mono audio
        signal_tensor = preprocess_audio(temp_path)
        # Convert to 1D numpy array for the transformers pipeline
        numpy_array = signal_tensor[0].cpu().numpy()
        
        # Run classification pipeline
        results = deepfake_pipe(numpy_array)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze deepfake: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/verify")
async def verify_speakers(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    if not encoder:
        raise HTTPException(status_code=500, detail="Speaker verification model not loaded.")
    
    suffix1 = os.path.splitext(file1.filename)[1]
    suffix2 = os.path.splitext(file2.filename)[1]
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix1) as temp_file1, \
         tempfile.NamedTemporaryFile(delete=False, suffix=suffix2) as temp_file2:
        
        temp_file1.write(await file1.read())
        temp_path1 = temp_file1.name
        
        temp_file2.write(await file2.read())
        temp_path2 = temp_file2.name

    try:
        signal1 = preprocess_audio(temp_path1)
        signal2 = preprocess_audio(temp_path2)
        
        with torch.no_grad():
            emb1 = encoder.encode_batch(signal1)[0, 0]
            emb2 = encoder.encode_batch(signal2)[0, 0]
            cos_sim = torch.nn.functional.cosine_similarity(emb1, emb2, dim=0).item()
            
        return {"similarity": cos_sim}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify speakers: {str(e)}")
    finally:
        if os.path.exists(temp_path1):
            os.remove(temp_path1)
        if os.path.exists(temp_path2):
            os.remove(temp_path2)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "speaker_verification": encoder is not None,
            "deepfake_detection": deepfake_pipe is not None
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
