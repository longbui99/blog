#!/bin/bash
# save as setup-minikube-mounts.sh

# Start Minikube with mounts
minikube start --driver=docker \
  --disk-size=50g \
  --ports=80:80

# Verify mounts
echo "Verifying mounts..."
minikube ssh "ls -la /data"