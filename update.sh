#!/bin/bash

# Stop the script if any command fails
set -e

SERVICE_NAME="data-entry.service"
APP_DIR="/root/Data-Entry-Site"

echo "--- 1. Stopping $SERVICE_NAME ---"
systemctl stop $SERVICE_NAME

echo "--- 2. Pulling latest code ---"
cd $APP_DIR
git pull

echo "--- 3. Installing dependencies ---"
npm install

echo "--- 4. Running Prisma migrations ---"
npx prisma db push

echo "--- 5. Starting $SERVICE_NAME ---"
systemctl start $SERVICE_NAME

echo "--- Update Complete! Checking status... ---"
systemctl status $SERVICE_NAME --no-pager