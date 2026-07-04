import os
import shutil
import numpy as np
import torch
import torchaudio
import torchaudio.transforms as T
from huggingface_hub import HfApi, hf_hub_download
from transformers import pipeline
from speechbrain.inference.speaker import EncoderClassifier
from speechbrain.utils.fetching import LocalStrategy

# Create temporary directory for test audio
TEST_DIR = "temp_test_audio"
os.makedirs(TEST_DIR, exist_ok=True)

print("Discovering test files on Hugging Face dataset...")
api = HfApi()
repo_id = "garystafford/deepfake-audio-detection"
try:
    all_files = api.list_repo_files(repo_id=repo_id, repo_type="dataset")
    print(f"Total files in dataset repository: {len(all_files)}")
except Exception as e:
    print(f"Error listing files from Hugging Face: {e}")
    all_files = []

# Filter files
real_files = [f for f in all_files if "real" in f.lower() and f.endswith((".flac", ".wav"))][:2]
fake_files = [f for f in all_files if "fake" in f.lower() and f.endswith((".flac", ".wav"))][:2]

if not real_files or not fake_files:
    print("Could not filter files dynamically. Using hardcoded list.")
    real_files = ["yt_0001.flac", "yt_0002.flac"]
    fake_files = ["el_0001.flac", "el_0002.flac"]

print(f"Filtered Real test files: {real_files}")
print(f"Filtered Fake test files: {fake_files}")

local_real = []
local_fake = []

# Download files
print("\nDownloading sample files...")
for idx, f in enumerate(real_files):
    try:
        local_path = hf_hub_download(repo_id=repo_id, repo_type="dataset", filename=f, local_dir=TEST_DIR)
        dest = os.path.join(TEST_DIR, f"real_{idx+1}.flac")
        shutil.move(local_path, dest)
        local_real.append(dest)
        print(f"Downloaded Real sample {idx+1} to {dest}")
    except Exception as e:
        print(f"Failed to download real file {f}: {e}")

for idx, f in enumerate(fake_files):
    try:
        local_path = hf_hub_download(repo_id=repo_id, repo_type="dataset", filename=f, local_dir=TEST_DIR)
        dest = os.path.join(TEST_DIR, f"fake_{idx+1}.flac")
        shutil.move(local_path, dest)
        local_fake.append(dest)
        print(f"Downloaded Fake sample {idx+1} to {dest}")
    except Exception as e:
        print(f"Failed to download fake file {f}: {e}")

# If downloads failed, download standard public files from github as fallbacks
if len(local_real) < 2:
    print("\nDownloading fallback real files from GitHub...")
    import urllib.request
    fallbacks = [
        ("https://github.com/ggerganov/whisper.cpp/raw/master/samples/jfk.wav", "real_1.wav"),
        ("https://github.com/realpython/python-speech-recognition/raw/master/audio_files/harvard.wav", "real_2.wav")
    ]
    for url, name in fallbacks:
        dest = os.path.join(TEST_DIR, name)
        print(f"Downloading {url} to {dest}...")
        urllib.request.urlretrieve(url, dest)
        local_real.append(dest)

# Load models
print("\nLoading models for testing...")
print("1. Loading SpeechBrain ECAPA-TDNN...")
encoder = EncoderClassifier.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb",
    savedir="pretrained_models/spkrec-ecapa-voxceleb",
    local_strategy=LocalStrategy.COPY
)

print("2. Loading Deepfake Detection Pipeline...")
deepfake_pipe = pipeline("audio-classification", model="mo-thecreator/Deepfake-audio-detection")

import soundfile as sf

def preprocess_audio(file_path: str) -> torch.Tensor:
    # Load audio using soundfile
    data, sr = sf.read(file_path)
    
    # Convert to PyTorch tensor
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

# Run verification tests
print("\n=== RUNNING SPEAKER VERIFICATION TESTS ===")
if len(local_real) >= 2:
    sig1 = preprocess_audio(local_real[0])
    emb1 = encoder.encode_batch(sig1)[0, 0]
    cos_sim_self = torch.nn.functional.cosine_similarity(emb1, emb1, dim=0).item()
    print(f"Cosine Similarity (real_1 vs real_1, same speaker): {cos_sim_self:.4f}")

    sig2 = preprocess_audio(local_real[1])
    emb2 = encoder.encode_batch(sig2)[0, 0]
    cos_sim_diff = torch.nn.functional.cosine_similarity(emb1, emb2, dim=0).item()
    print(f"Cosine Similarity (real_1 vs real_2, likely different speakers): {cos_sim_diff:.4f}")

# Run deepfake detection tests
print("\n=== RUNNING DEEPFAKE DETECTION TESTS ===")
for path in local_real + local_fake:
    # Preprocess to get the 16kHz mono tensor
    sig = preprocess_audio(path)
    # Convert [1, time] tensor to 1D numpy array
    numpy_array = sig[0].cpu().numpy()
    
    # Run pipeline on the numpy array
    results = deepfake_pipe(numpy_array)
    print(f"\nFile: {path}")
    for res in results:
        print(f"  {res['label']}: {res['score']:.4f}")

# Clean up downloaded files
print("\nCleaning up test files...")
try:
    shutil.rmtree(TEST_DIR)
except Exception as e:
    print(f"Error during cleanup: {e}")
print("Test pipeline execution complete.")
