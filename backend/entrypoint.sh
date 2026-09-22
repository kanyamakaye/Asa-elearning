#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

# daphne (ASGI) replaces gunicorn (WSGI) so this one process serves both the
# existing plain HTTP views and the WebSocket endpoints under /ws/ — see
# Realtime.md #4/#14. It still serves every existing DRF view unchanged.
exec daphne -b 0.0.0.0 -p 8000 config.asgi:application
