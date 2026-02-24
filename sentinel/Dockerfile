FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy our code and HTML dashboard into the container
COPY . .

# Expose the web port
EXPOSE 8000

# Start the FastAPI server (not just python sentinel.py)
CMD ["uvicorn", "sentinel:app", "--host", "0.0.0.0", "--port", "8000"]