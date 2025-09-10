#!/bin/bash

# FeelTiming Django Application Deployment Script
# This script deploys the Django application to EC2 instance

set -e  # Exit on any error

# Variables from Terraform
DJANGO_SECRET_KEY="${django_secret_key}"
DJANGO_DEBUG="${django_debug}"
DJANGO_ALLOWED_HOSTS="${django_allowed_hosts}"
KAKAO_MAP_API_KEY="${kakao_map_api_key}"
PROJECT_NAME="feeltiming"
APP_USER="ubuntu"
APP_DIR="/opt/feeltiming"
REPO_URL="https://github.com/yourusername/feeltiming.git"  # Update with your repo

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a /var/log/django_deployment.log
}

# Function to handle errors
error_exit() {
    log "ERROR: $1"
    exit 1
}

log "Starting FeelTiming Django deployment..."

# Update system packages
log "Updating system packages..."
apt-get update -y || error_exit "Failed to update packages"

# Install required packages
log "Installing required packages..."
apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    nginx \
    supervisor \
    postgresql-client \
    curl \
    wget \
    unzip || error_exit "Failed to install packages"

# Create application user and directory
log "Setting up application environment..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER || error_exit "Failed to create user"
fi

mkdir -p $APP_DIR
chown $APP_USER:$APP_USER $APP_DIR

# Clone or update the repository
log "Cloning/updating repository..."
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    sudo -u $APP_USER git pull origin main || error_exit "Failed to update repository"
else
    sudo -u $APP_USER git clone $REPO_URL $APP_DIR || error_exit "Failed to clone repository"
fi

cd $APP_DIR

# Create virtual environment
log "Creating Python virtual environment..."
sudo -u $APP_USER python3 -m venv venv || error_exit "Failed to create virtual environment"

# Install Python dependencies
log "Installing Python dependencies..."
sudo -u $APP_USER ./venv/bin/pip install --upgrade pip || error_exit "Failed to upgrade pip"
sudo -u $APP_USER ./venv/bin/pip install -r requirements.txt || error_exit "Failed to install requirements"

# Create environment file
log "Creating environment configuration..."
cat > $APP_DIR/.env << EOF
SECRET_KEY=$DJANGO_SECRET_KEY
DEBUG=$DJANGO_DEBUG
ALLOWED_HOSTS=$DJANGO_ALLOWED_HOSTS
KAKAO_MAP_API_KEY=$KAKAO_MAP_API_KEY
EOF

chown $APP_USER:$APP_USER $APP_DIR/.env
chmod 600 $APP_DIR/.env

# Run Django migrations
log "Running Django migrations..."
sudo -u $APP_USER $APP_DIR/venv/bin/python $APP_DIR/manage.py migrate || error_exit "Failed to run migrations"

# Collect static files
log "Collecting static files..."
sudo -u $APP_USER $APP_DIR/venv/bin/python $APP_DIR/manage.py collectstatic --noinput || error_exit "Failed to collect static files"

# Create superuser if not exists
log "Creating Django superuser..."
sudo -u $APP_USER $APP_DIR/venv/bin/python $APP_DIR/manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@feeltiming.com', 'changeme123!')
    print("Superuser created")
else:
    print("Superuser already exists")
EOF

# Configure Gunicorn
log "Configuring Gunicorn..."
cat > /etc/supervisor/conf.d/feeltiming.conf << EOF
[program:feeltiming]
command=$APP_DIR/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 feeltiming.wsgi:application
directory=$APP_DIR
user=$APP_USER
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/feeltiming.log
environment=PATH="$APP_DIR/venv/bin"
EOF

# Install Gunicorn if not already installed
sudo -u $APP_USER $APP_DIR/venv/bin/pip install gunicorn || error_exit "Failed to install gunicorn"

# Configure Nginx
log "Configuring Nginx..."
cat > /etc/nginx/sites-available/feeltiming << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 75M;
    
    location /static/ {
        alias /opt/feeltiming/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    location /media/ {
        alias /opt/feeltiming/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/feeltiming /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t || error_exit "Nginx configuration test failed"

# Start services
log "Starting services..."
systemctl reload supervisor || error_exit "Failed to reload supervisor"
supervisorctl reread || error_exit "Failed to reread supervisor config"
supervisorctl update || error_exit "Failed to update supervisor"
supervisorctl start feeltiming || error_exit "Failed to start feeltiming service"

systemctl restart nginx || error_exit "Failed to restart nginx"
systemctl enable nginx || error_exit "Failed to enable nginx"

# Create a simple health check endpoint
log "Setting up health check..."
cat > $APP_DIR/health_check.py << 'EOF'
#!/usr/bin/env python3
import requests
import sys

try:
    response = requests.get('http://localhost:8000/', timeout=10)
    if response.status_code == 200:
        print("Health check passed")
        sys.exit(0)
    else:
        print(f"Health check failed with status code: {response.status_code}")
        sys.exit(1)
except Exception as e:
    print(f"Health check failed with error: {e}")
    sys.exit(1)
EOF

chown $APP_USER:$APP_USER $APP_DIR/health_check.py
chmod +x $APP_DIR/health_check.py

# Wait for application to start and perform health check
log "Waiting for application to start..."
sleep 30

log "Performing health check..."
sudo -u $APP_USER python3 $APP_DIR/health_check.py || log "Warning: Health check failed, but continuing deployment"

log "Django deployment completed successfully!"
log "Application should be available at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
log "Admin interface: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/admin"
log "Default admin credentials: admin / changeme123!"

# Create a simple status script
cat > /usr/local/bin/feeltiming-status << 'EOF'
#!/bin/bash
echo "=== FeelTiming Application Status ==="
echo "Supervisor status:"
supervisorctl status feeltiming
echo ""
echo "Nginx status:"
systemctl status nginx --no-pager -l
echo ""
echo "Application logs (last 20 lines):"
tail -n 20 /var/log/feeltiming.log
EOF

chmod +x /usr/local/bin/feeltiming-status

log "Deployment script completed. Use 'feeltiming-status' to check application status."