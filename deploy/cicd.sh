#!/bin/bash
set -x
cd ../
sudo git pull origin master
cd ui && npm install && npm run build
docker-compose restart
cd ../
cd webserver && source venv/bin/activate && pip3 install -r requirements
sudo systemctl restart blogserver