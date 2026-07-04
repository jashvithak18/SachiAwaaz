# SachiAwaaz — Personal Voice Verification & AI Deepfake Detector
### Tagline: Is this really them?

SachiAwaaz is a safety-critical voice verification and deepfake detection system designed for families to combat AI-generated voice scams. It is a hackathon prototype developed for **HACKHAZARDS'26** (Trust/Identity & Security Track).

## How this is different

Existing solutions in the audio security market address synthetic speech detection in a generic way:
- **Hiya Deepfake Voice Detector**: A browser extension that analyzes audio on web pages to classify if it is real or synthetic.
- **Resemble AI Detect**: A developer API returning a synthetic-speech confidence score for arbitrary audio inputs.
- **Pindrop**: Enterprise-grade fraud detection engineered specifically for call-center security.

**The Gap:** All three of these tools answer the generic question: *"Is this audio synthetic?"* None of them perform personal speaker enrollment or verify a voice clip against a specific, trusted individual's voice. 

**SachiAwaaz's Core Differentiator:** Generic tools can only tell you if a voice sounds real or AI-generated in a general sense. SachiAwaaz goes beyond this by comparing query audio directly against a secure, enrolled voiceprint of your specific family member. This means even if an AI clone is highly realistic and bypasses generic detection, SachiAwaaz can check if it actually matches your loved one's authentic voice pattern.

---

## System Architecture

The application is structured into three main layers:
1. **ML Microservice (Python / FastAPI)**: Loads pre-trained Hugging Face models (`speechbrain/spkrec-ecapa-voxceleb` for voiceprint comparison and `mo-thecreator/Deepfake-audio-detection` for synthetic classification) and exposes endpoints.
2. **Main Backend (Node.js / Express)**: Connects to MongoDB, manages enrollment data, handles authentication, and coordinates the verification pipeline.
3. **Frontend Client (React 18 / Vite / Tailwind CSS)**: Clean, high-legibility light theme designed for ease of use under stress.

## Running the Project

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (running locally on port `27017`)

### 1. ML Microservice
```bash
# From the root directory
python -m venv venv
.\venv\Scripts\activate
pip install fastapi uvicorn speechbrain transformers torch torchaudio soundfile python-multipart
python ml_service/main.py
```

### 2. Express Backend
```bash
# From the root directory
cd backend
npm install
npm run start
```

### 3. React Frontend
```bash
# From the root directory
cd frontend
npm install
npm run dev
```
