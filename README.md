# academy-interfacelm


sudo chown -R nginx:nginx /home/ec2-user/academy-interface/dist/
sudo chmod 755 /home/ec2-user/academy-interface/dist/
sudo chmod 644 /home/ec2-user/academy-interface/dist/*
sudo nginx -s reload



scp -i /Users/gapaza/Dropbox/Keys/gabe-master.pem ./* ec2-user@3.144.92.81:/home/ec2-user/academy-interface/src/store/content/ISC-SpaceMissionOverview

scp -i /Users/gapaza/Dropbox/Keys/gabe-master.pem ./* ec2-user@3.144.92.81:/home/ec2-user/academy-interface/src/store/content/ISC-SpaceEnvAndOrbs

scp -i /Users/gapaza/Dropbox/Keys/gabe-master.pem ./* ec2-user@3.144.92.81:/home/ec2-user/academy-interface/src/store/content/ISC-SpacecraftTechAndArch

scp -i /Users/gapaza/Dropbox/Keys/gabe-master.pem ./* ec2-user@3.144.92.81:/home/ec2-user/academy-interface/src/store/content/ISC-SatScientificPayload







