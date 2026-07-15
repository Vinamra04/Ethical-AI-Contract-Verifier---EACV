FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first — this layer is cached and only rebuilds when requirements change
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML model into image so it is always available (no volume mount needed for the model)
COPY Colab/ethical_risk_bundle.pkl /app/model/ethical_risk_bundle.pkl

# Copy backend source code
COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
