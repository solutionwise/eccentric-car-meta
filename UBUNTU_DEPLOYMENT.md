# Ubuntu Server Deployment Guide

## Server Requirements ✅

Your **4-core, 8GB RAM** server is perfect for this application:

- **CPU**: 4 cores (sufficient for Node.js + Weaviate + system overhead)
- **RAM**: 8GB (optimal for the stack)
- **Storage**: 20GB+ recommended (5GB app + 10GB images + 5GB system)
- **OS**: Ubuntu 20.04 LTS or 22.04 LTS

## Resource Allocation

```
┌─────────────────────────────────────┐
│ 8GB RAM Allocation                  │
├─────────────────────────────────────┤
│ Weaviate Vector DB: ~2GB            │
│ Node.js Backend: ~500MB             │
│ Nuxt.js Frontend: ~300MB            │
│ Transformers.js CLIP: ~1.5GB        │
│ System + Buffer: ~3.7GB             │
└─────────────────────────────────────┘
```

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common
```

### 1.2 Install Node.js 18+
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v18.x.x
npm --version
```

### 1.3 Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.4 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 1.5 Install Nginx (Reverse Proxy)
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Step 2: Application Deployment

### 2.1 Clone Repository
```bash
cd /opt
sudo git clone <your-repository-url> eccentric-car-meta
sudo chown -R $USER:$USER eccentric-car-meta
cd eccentric-car-meta
```

### 2.2 Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install --production
cd ..

# Install frontend dependencies
cd frontend
npm install
npm run build
cd ..
```

### 2.3 Environment Configuration
```bash
# Backend environment
cd backend
cp env.example .env
nano .env
```

**Production .env configuration:**
```env
PORT=3001
WEAVIATE_URL=http://localhost:8080
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
UPLOAD_DIR=/opt/eccentric-car-meta/uploads
DATABASE_PATH=/opt/eccentric-car-meta/backend/database.sqlite
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
NODE_ENV=production
```

### 2.4 Create Directories
```bash
sudo mkdir -p /opt/eccentric-car-meta/uploads
sudo chown -R $USER:$USER /opt/eccentric-car-meta/uploads
```

## Step 3: Start Services

### 3.1 Start Weaviate (Vector Database)
```bash
cd /opt/eccentric-car-meta
docker-compose up -d weaviate
```

### 3.2 Start Backend with PM2
```bash
cd /opt/eccentric-car-meta/backend
pm2 start src/app.js --name "car-meta-backend" --env production
pm2 save
pm2 startup
```

### 3.3 Start Frontend with PM2
```bash
cd /opt/eccentric-car-meta/frontend
pm2 start npm --name "car-meta-frontend" -- run preview
pm2 save
```

## Step 4: Nginx Configuration

### 4.1 Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/car-meta
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Frontend (Nuxt.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for image processing
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /opt/eccentric-car-meta/uploads/;
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
```

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/car-meta /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: SSL Certificate (Optional but Recommended)

### 5.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

## Step 6: Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

## Step 7: Monitoring & Maintenance

### 7.1 Check Service Status
```bash
# Check PM2 processes
pm2 status

# Check Docker containers
docker ps

# Check Nginx status
sudo systemctl status nginx

# Check system resources
htop
```

### 7.2 Log Monitoring
```bash
# PM2 logs
pm2 logs car-meta-backend
pm2 logs car-meta-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### 7.3 Backup Script
```bash
# Create backup script
sudo nano /opt/backup-car-meta.sh
```

```bash
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
```

```bash
sudo chmod +x /opt/backup-car-meta.sh

# Add to crontab for daily backups
sudo crontab -e
# Add this line:
# 0 2 * * * /opt/backup-car-meta.sh
```

## Performance Optimization

### Memory Optimization
```bash
# Add to /etc/sysctl.conf
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### PM2 Configuration
```bash
# Create ecosystem file
nano /opt/eccentric-car-meta/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'car-meta-backend',
      script: './backend/src/app.js',
      cwd: '/opt/eccentric-car-meta',
      instances: 2, // Use 2 CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/car-meta-backend-error.log',
      out_file: '/var/log/pm2/car-meta-backend-out.log',
      log_file: '/var/log/pm2/car-meta-backend.log'
    },
    {
      name: 'car-meta-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/opt/eccentric-car-meta/frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      max_memory_restart: '500M'
    }
  ]
};
```

## Troubleshooting

### Common Issues

1. **Out of Memory**
   ```bash
   # Check memory usage
   free -h
   # Restart services
   pm2 restart all
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo netstat -tulpn | grep :3001
   # Kill process if needed
   sudo kill -9 <PID>
   ```

3. **Weaviate Connection Issues**
   ```bash
   # Check Weaviate logs
   docker logs weaviate
   # Restart Weaviate
   docker-compose restart weaviate
   ```

4. **CLIP Model Loading Issues**
   ```bash
   # Clear model cache
   rm -rf ~/.cache/huggingface/
   # Restart backend
   pm2 restart car-meta-backend
   ```

## Security Checklist

- [ ] Change default SSH port
- [ ] Disable root login
- [ ] Set up fail2ban
- [ ] Configure firewall (UFW)
- [ ] Use strong passwords/keys
- [ ] Enable SSL/TLS
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## Expected Performance

With your 4-core, 8GB server:
- **Concurrent Users**: 10-15 users
- **Search Response**: 1-3 seconds
- **Image Upload**: 2-5 seconds per image
- **Uptime**: 99%+ with proper monitoring

## Next Steps

1. Set up monitoring (Prometheus + Grafana)
2. Configure log rotation
3. Set up automated backups
4. Implement health checks
5. Consider load balancing for scaling

---

**Need help?** Check the logs first, then review this guide for common solutions.
