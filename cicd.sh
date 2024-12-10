#!/bin/bash
set -x
sudo git pull origin master
cd ui && npm install && npm run build
cd ../webserver && source venv/bin/activate && pip3 install -r requirements
sudo systemctl restart blogserver