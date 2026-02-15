FROM python:3.9-slim
WORKDIR /app

# We explicitly add 'docker' to the install list here vvv
RUN pip install --no-cache-dir requests scikit-learn numpy docker groq

COPY sentinel.py .
CMD ["python", "-u", "sentinel.py"]
