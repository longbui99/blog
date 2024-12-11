#!/bin/bash
set -x
cd ../
sudo git pull origin master
cd ui && npm install && npm run build
sudo systemctl restart blogserver