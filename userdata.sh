#!/bin/bash
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "Starting Jitsi Provisioning..."
apt-get update -y
apt-get install -y curl git apt-transport-https ca-certificates software-properties-common
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

mkdir -p /root/jitsi-server
cd /root/jitsi-server
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet

cp env.example .env
./gen-passwords.sh

cat << ENV_UPDATE >> .env
PUBLIC_URL=https://meet.newhollandfinancial.com
TZ=America/New_York
ENABLE_AUTH=1
AUTH_TYPE=jwt
JWT_APP_ID=nhfg_crm_5cc19aeeedae
JWT_APP_SECRET=9b1655f71aa052406ac499e5d1b48f4bc1ec120d5781d626
ENABLE_LETSENCRYPT=1
LETSENCRYPT_DOMAIN=meet.newhollandfinancial.com
LETSENCRYPT_EMAIL=sales@newhollandfinancial.com
HTTP_PORT=80
HTTPS_PORT=443
ENV_UPDATE

cat << 'SVC' > /etc/systemd/system/jitsi.service
[Unit]
Description=Jitsi Meet Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/jitsi-server/docker-jitsi-meet
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down

[Install]
WantedBy=multi-user.target
SVC

systemctl daemon-reload
systemctl enable jitsi.service
systemctl start jitsi.service
echo "Jitsi Provisioning Complete!"
