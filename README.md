# EACV

EACV is a mobile-first document-analysis app that helps people understand the risks hidden inside contracts, privacy policies, and other agreements before they sign them.

The platform accepts input from pasted text, URLs, PDFs, and images, extracts the key clauses, classifies them with a machine-learning model and dark-pattern heuristics, and returns a clear summary with a High / Medium / Low risk assessment.

## What it does

- Analyzes terms and policies from multiple input types
- Detects risky clauses and manipulative patterns such as auto-renewal, forced consent, broad surveillance, data sharing, and indefinite retention
- Produces a plain-English explanation of the most important risks
- Saves analyses to a per-user history for future review
- Supports authentication and account management through Supabase

## Architecture

EACV is split into three main parts:

- Mobile app: a React Native / Expo client for scanning, uploading, and reviewing results
- Backend API: a FastAPI service that performs extraction, classification, aggregation, and explanation generation
- Data layer: Supabase for authentication, user history, and storage

### High-level flow

1. User submits text, a URL, a PDF, or an image
2. The backend extracts and cleans the relevant clauses
3. The analyzer classifies each clause and looks for known dark patterns
4. The results are aggregated into a final risk verdict and explanation
5. The outcome is saved and shown in the mobile app

## Tech stack

### Backend
- Python 3.11
- FastAPI
- Uvicorn
- scikit-learn
- pdfplumber
- trafilatura
- pytesseract
- Pillow
- Supabase Python client
- Google Gemini API

### Mobile app
- React Native
- Expo Router
- TypeScript
- Expo Image Picker / Document Picker
- Supabase JS client

### Infrastructure
- Docker Compose
- Supabase Postgres + Auth + Storage

## Repository structure

- `backend/` – FastAPI app, analysis pipeline, services, and tests
- `mobile/` – Expo application screens, components, and shared client code
- `supabase/` – SQL schema and setup instructions
- `docs/` – design and implementation planning documents
- `Colab/` – the ML model bundle used by the backend

## Getting started

### Prerequisites

- Python 3.11
- Node.js and npm
- Docker Desktop (optional, recommended for local backend runs)
- A Supabase project
- A Google Gemini API key

### 1. Backend setup

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Then update `backend/.env` with your values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

Run the backend with Docker:

```bash
docker compose up --build
```

The backend API will be available at:

- `http://localhost:8000/health`

### 2. Mobile app setup

From the `mobile/` directory, create or update your environment file:

```bash
cd mobile
```

Set the required Expo environment variables in `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Install dependencies and start Expo:

```bash
npm install
npx expo start
```

### 3. Supabase setup

Follow the instructions in `supabase/SETUP.md` to create the project, configure auth, and apply the SQL schema.

## Environment variables

### Backend
- `SUPABASE_URL` – Supabase project URL
- `SUPABASE_SERVICE_KEY` – service role key for backend operations
- `GEMINI_API_KEY` – API key for explanation generation
- `MODEL_PATH` – optional override for the ML model bundle path

### Mobile
- `EXPO_PUBLIC_SUPABASE_URL` – Supabase project URL for the client app
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` – anonymous key used by the app
- `EXPO_PUBLIC_API_URL` – base URL for the FastAPI backend

## Testing

Run backend tests with:

```bash
cd backend
pytest
```

## Notes

The backend uses a bundled ML model file located under `Colab/ethical_risk_bundle.pkl` for clause classification. The Docker image includes this file automatically, so local container runs are set up to work out of the box.
