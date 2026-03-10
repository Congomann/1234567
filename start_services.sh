#!/bin/bash
node backend/server.cjs &
npm run dev &
wait
