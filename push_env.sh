#!/bin/bash
echo "Pushing SMTP_HOST..."
echo "smtp.larksuite.com" | npx vercel env add SMTP_HOST production,preview,development
echo "Pushing SMTP_PORT..."
echo "465" | npx vercel env add SMTP_PORT production,preview,development
echo "Pushing SMTP_SECURE..."
echo "true" | npx vercel env add SMTP_SECURE production,preview,development
echo "Pushing SMTP_USER..."
echo "sales@newhollandfinancial.com" | npx vercel env add SMTP_USER production,preview,development
echo "Pushing SMTP_PASS..."
echo "0JmzhnYLWPXvePcp" | npx vercel env add SMTP_PASS production,preview,development
echo "Pushing EMAIL_FROM..."
echo "New Holland Financial Group <sales@newhollandfinancial.com>" | npx vercel env add EMAIL_FROM production,preview,development
echo "Pushing NEW_DATABASE_URL..."
echo "postgres://postgres.kgpwgqbhethkowmcrsso:3peo3zS7EaurR9g9@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true" | npx vercel env add DATABASE_URL production,preview,development
echo "Pushing NEW_SUPABASE_URL..."
echo "https://kgpwgqbhethkowmcrsso.supabase.co" | npx vercel env add VITE_SUPABASE_URL production,preview,development

echo "Finished pushing environment variables! Please redeploy on Vercel."
