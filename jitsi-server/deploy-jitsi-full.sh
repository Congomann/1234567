#!/bin/bash
echo "======================================================="
echo " NHFG Jitsi Enterprise DevOps Setup (Fully Automated)  "
echo "======================================================="

# Ensure running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script with sudo or as root."
  exit
fi

# 1. Install prerequisites if missing
echo "-> Installing dependencies (Docker, Curl, Git)..."
apt-get update -y
apt-get install -y curl git apt-transport-https ca-certificates software-properties-common
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 2. Clone Jitsi
echo "-> Downloading official Jitsi architecture..."
rm -rf docker-jitsi-meet
git clone https://github.com/jitsi/docker-jitsi-meet.git
cd docker-jitsi-meet

# 3. Security configurations
echo "-> Generating cryptographic keys and secrets..."
cp env.example .env
./gen-passwords.sh

JITSI_APP_ID="nhfg_crm_$(openssl rand -hex 6)"
JITSI_APP_SECRET="$(openssl rand -hex 24)"

# 4. Configure .env for Let's Encrypt and JWT
echo "-> Injecting NHFG parameters (SSL + JWT Auth)..."
cat << ENV_UPDATE >> .env

# --- NHFG ENTERPRISE CONFIGURATION ---
PUBLIC_URL=https://meet.newhollandfinancial.com
TZ=America/New_York

# Enable JWT Authentication (CRM Integration)
ENABLE_AUTH=1
AUTH_TYPE=jwt
JWT_APP_ID=$JITSI_APP_ID
JWT_APP_SECRET=$JITSI_APP_SECRET

# Let's Encrypt SSL Configuration (Automatic HTTPS)
ENABLE_LETSENCRYPT=1
LETSENCRYPT_DOMAIN=meet.newhollandfinancial.com
LETSENCRYPT_EMAIL=sales@newhollandfinancial.com

# HTTP Port configurations (Docker will bind to these)
HTTP_PORT=80
HTTPS_PORT=443
# -------------------------------------
ENV_UPDATE

# 5. Create Systemd Service for persistence on reboots
echo "-> Creating Systemd service for auto-start on reboot..."
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

echo "======================================================="
echo " DEPLOYMENT READY! "
echo "======================================================="
echo ""
echo "To bring the server online right now, just run:"
echo "  cd docker-jitsi-meet && docker-compose up -d"
echo ""
echo "The system will automatically request an SSL certificate from Let's Encrypt."
echo "(Make sure your DNS A-Record for meet.newhollandfinancial.com points to this server's IP!)"
echo ""
echo "🔥 CRITICAL - COPY THESE TO YOUR CRM backend/.env 🔥"
echo "JITSI_DOMAIN=meet.newhollandfinancial.com"
echo "JITSI_APP_ID=$JITSI_APP_ID"
echo "JITSI_APP_SECRET=$JITSI_APP_SECRET"
echo "======================================================="
