#!/bin/bash
set -x
sudo git pull origin master
cd ui && npm install && npm run build
sudo systemctl restart blogserver