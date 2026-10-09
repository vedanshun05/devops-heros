FROM python:3.12-alpine
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && adduser -D -u 10001 appuser
COPY app ./app
USER 10001
EXPOSE 5001
CMD ["python", "app/app.py"]
