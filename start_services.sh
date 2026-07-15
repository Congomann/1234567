#!/bin/bash
node backend/server.cjs &
PORT=8000 backend_python/venv/bin/python3 backend_python/main.py &
npm run dev &
wait
