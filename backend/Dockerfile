FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# libpq5 is the runtime Postgres client lib psycopg2-binary needs even though
# it ships a prebuilt wheel. build-essential/libpq-dev only exist to compile
# anything that lacks a wheel for this platform, so they're installed and
# purged in the same layer to keep the final image small.
COPY requirements.txt .
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev libpq5 \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN useradd --create-home --uid 1000 appuser \
    && mkdir -p /app/media /app/staticfiles \
    && chown -R appuser:appuser /app \
    && chmod +x /app/entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
