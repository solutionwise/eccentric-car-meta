#!/bin/bash

# Eccentric Car Finder - Ubuntu Deployment Script
# For 4-core, 8GB RAM servers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="eccentric-car-meta"
APP_DIR="/opt/$APP_NAME"
DOMAIN=""
HUGGINGFACE_API_KEY=""
JWT_SECRET=""

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Get user input
get_config() {
    echo -e "${BLUE}🚀 Eccentric Car Finder - Ubuntu Deployment${NC}"
    echo "================================================"
    
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    read -p "Enter your Hugging Face API key: " HUGGINGFACE_API_KEY
    read -s -p "Enter a secure JWT secret (min 32 chars): " JWT_SECRET
    echo
    
    if [[ ${#JWT_SECRET} -lt 32 ]]; then
        log_error "JWT secret must be at least 32 characters long"
        exit 1
    fi
}

# Update system
update_system() {
    log_info "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common htop
    log_success "System updated"
}

# Install Node.js
install_nodejs() {
    log_info "Installing Node.js 18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log_success "Node.js installed: $(node --version)"
}

# Install Docker
install_docker() {
    log_info "Installing Docker and Docker Compose..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    log_success "Docker installed: $(docker --version)"
    log_success "Docker Compose installed: $(docker-compose --version)"
}

# Install PM2
install_pm2() {
    log_info "Installing PM2 process manager..."
    sudo npm install -g pm2
    log_success "PM2 installed"
}

# Install Nginx
install_nginx() {
    log_info "Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    log_success "Nginx installed and started"
}

# Clone and setup application
setup_application() {
    log_info "Setting up application..."
    
    # Create app directory
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    
    # If not already cloned, clone the repository
    if [ ! -d "$APP_DIR/.git" ]; then
        log_info "Please ensure your code is in $APP_DIR"
        log_info "You can clone it with: git clone <your-repo-url> $APP_DIR"
        read -p "Press Enter when your code is ready in $APP_DIR..."
    fi
    
    cd $APP_DIR
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm install
    
    cd backend
    npm install --production
    cd ..
    
    cd frontend
    npm install
    npm run build
    cd ..
    
    # Create uploads directory
    mkdir -p uploads
    sudo chown -R $USER:$USER uploads
    
    log_success "Application setup complete"
}

# Configure environment
configure_environment() {
    log_info "Configuring environment..."
    
    cd $APP_DIR/backend
    cp env.example .env
    
    # Update .env with production values
    cat > .env << EOF
PORT=3001
WEAVIATE_URL=http://localhost:8080
HUGGINGFACE_API_KEY=$HUGGINGFACE_API_KEY
UPLOAD_DIR=$APP_DIR/uploads
DATABASE_PATH=$APP_DIR/backend/database.sqlite
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
EOF
    
    cd $APP_DIR
    log_success "Environment configured"
}

# Start services
start_services() {
    log_info "Starting services..."
    
    cd $APP_DIR
    
    # Start Weaviate
    log_info "Starting Weaviate vector database..."
    docker-compose up -d weaviate
    
    # Wait for Weaviate to be ready
    log_info "Waiting for Weaviate to be ready..."
    sleep 30
    
    # Start backend with PM2
    log_info "Starting backend with PM2..."
    cd backend
    pm2 start src/app.js --name "car-meta-backend" --env production
    cd ..
    
    # Start frontend with PM2
    log_info "Starting frontend with PM2..."
    cd frontend
    pm2 start npm --name "car-meta-frontend" -- run preview
    cd ..
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
    
    log_success "Services started"
}

# Configure Nginx
configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/car-meta > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend (Nuxt.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Increase timeout for image processing
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (uploads)
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/car-meta /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    log_success "Nginx configured"
}

# Configure firewall
configure_firewall() {
    log_info "Configuring firewall..."
    
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    
    log_success "Firewall configured"
}

# Create backup script
create_backup_script() {
    log_info "Creating backup script..."
    
    sudo tee /opt/backup-car-meta.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/car-meta"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /opt/eccentric-car-meta/backend/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/eccentric-car-meta/uploads/

# Backup Weaviate data
docker exec weaviate tar -czf /tmp/weaviate_backup_$DATE.tar.gz /var/lib/weaviate
docker cp weaviate:/tmp/weaviate_backup_$DATE.tar.gz $BACKUP_DIR/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

    sudo chmod +x /opt/backup-car-meta.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-car-meta.sh") | crontab -
    
    log_success "Backup script created"
}

# Main deployment function
main() {
    log_info "Starting deployment process..."
    
    check_root
    get_config
    update_system
    install_nodejs
    install_docker
    install_pm2
    install_nginx
    setup_application
    configure_environment
    start_services
    configure_nginx
    configure_firewall
    create_backup_script
    
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo -e "${GREEN}Your application is now running at:${NC}"
    echo -e "  🌐 Frontend: http://$DOMAIN"
    echo -e "  🔧 Backend API: http://$DOMAIN/api"
    echo -e "  📊 Admin Panel: http://$DOMAIN/admin"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN"
    echo "  2. Check service status: pm2 status"
    echo "  3. Monitor logs: pm2 logs"
    echo "  4. Test your application"
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo "  • Restart services: pm2 restart all"
    echo "  • View logs: pm2 logs"
    echo "  • Check status: pm2 status"
    echo "  • Backup: /opt/backup-car-meta.sh"
    echo ""
    log_warning "Please log out and back in for Docker group changes to take effect"
}

# Run main function
main "$@"
