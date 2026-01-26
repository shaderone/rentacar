#!/bin/bash

# MODE 1: COMMIT & DEPLOY (If you provide a message)
if [ -n "$1" ]; then
  echo "🚀 STEP 1: Committing & Pushing to GitHub..."
  git add .
  git commit -m "$1"
  git push origin main

# MODE 2: JUST DEPLOY (If you leave message empty)
else
  echo "⏩ STEP 1: Skipping Commit (No message). Deploying current GitHub code..."
fi

echo "☁️ STEP 2: Connecting to Server..."
ssh rentacar <<EOF
  cd ~/rentacar
  
  # 1. Force Sync with GitHub
  git fetch --all
  git reset --hard origin/main
  
  # 2. Rebuild Containers
  sudo docker-compose up -d --build --force-recreate
  
  echo "✅ Deployment Complete!"
EOF