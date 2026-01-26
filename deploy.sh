#!/bin/bash

# 1. Get the commit message
if [ -z "$1" ]; then
  echo "❌ Error: Missing commit message."
  echo "Usage: ./deploy.sh \"Your commit message here\""
  exit 1
fi

echo "🚀 STEP 1: Pushing changes to GitHub..."
git add .
git commit -m "$1"
git push origin main

echo "☁️ STEP 2: Connecting to Server & Updating..."
# This sends a command over SSH to pull and rebuild specific services
ssh rentacar <<EOF
  cd ~/rentacar'

  echo "🔄 Syncing with GitHub (Hard Reset)..."
  git fetch --all
  git reset --hard origin/main
  
  echo "⬇️ Pulling latest code..."
  git pull origin main
  
  echo "🐳 Rebuilding Sentinel & Backend..."
  # We only rebuild the services that changed to save time
  sudo docker-compose up -d --build
  
  echo "✅ Deployment Complete!"
EOF
