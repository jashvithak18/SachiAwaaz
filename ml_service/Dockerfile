FROM python:3.10-slim

WORKDIR /code

# Install system audio dependencies
RUN apt-get update && apt-get install -y libsndfile1 && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Create cache directories for huggingface models and grant access
RUN mkdir -p /.cache && chmod -R 777 /.cache
ENV HF_HOME=/.cache

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
