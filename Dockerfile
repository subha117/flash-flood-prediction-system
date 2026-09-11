FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for rasterio and networking
RUN apt-get update && apt-get install -y \\
    gdal-bin \\
    libgdal-dev \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Export CPLUS_INCLUDE_PATH and C_INCLUDE_PATH for GDAL
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create the database and necessary files before starting
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
