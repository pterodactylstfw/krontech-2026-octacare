FROM python:3.11-slim

WORKDIR /app

# Instalăm dependențele de sistem necesare pentru OR-Tools
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiem fișierul de cerințe și instalăm pachetele Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiem restul codului sursă
COPY . .

# Expunem portul pe care rulează FastAPI
EXPOSE 8000

# Comanda de pornire
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
