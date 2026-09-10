#!/bin/bash
sudo docker exec docker-jitsi-meet-web-1 sed -i "s/\"title\": \"Jitsi Meet\"/\"title\": \"New Holland Financial Group Meeting\"/g" /usr/share/jitsi-meet/lang/main.json
sudo docker exec docker-jitsi-meet-web-1 sed -i "s/\"appDescription\": \"Secure and high quality meetings\"/\"appDescription\": \"Secure and confidential financial planning\"/g" /usr/share/jitsi-meet/lang/main.json
sudo docker exec docker-jitsi-meet-web-1 sed -i "s/\"title\": \"Jitsi Meet\"/\"title\": \"New Holland Financial Group Meeting\"/g" /usr/share/jitsi-meet/lang/main-enGB.json || true
sudo docker exec docker-jitsi-meet-web-1 sed -i "s/\"appDescription\": \"Secure and high quality meetings\"/\"appDescription\": \"Secure and confidential financial planning\"/g" /usr/share/jitsi-meet/lang/main-enGB.json || true
