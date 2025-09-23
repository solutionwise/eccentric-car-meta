# Monitoring & Maintenance Guide

## System Monitoring

### 1. Service Status Monitoring

#### Check All Services
```bash
# PM2 processes
pm2 status

# Docker containers
docker ps

# Nginx status
sudo systemctl status nginx

# System resources
htop
```

#### Service Health Checks
```bash
# Backend health
curl -f http://localhost:3001/api/health || echo "Backend down"

# Frontend health
curl -f http://localhost:3000 || echo "Frontend down"

# Weaviate health
curl -f http://localhost:8080/v1/meta || echo "Weaviate down"
```

### 2. Log Monitoring

#### PM2 Logs
```bash
# All logs
pm2 logs

# Specific service logs
pm2 logs car-meta-backend
pm2 logs car-meta-frontend

# Follow logs in real-time
pm2 logs --follow

# Clear logs
pm2 flush
```

#### System Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u docker -f

# PM2 logs location
tail -f /var/log/pm2/car-meta-*.log
```

### 3. Resource Monitoring

#### Memory Usage
```bash
# Current memory usage
free -h

# Memory usage by process
ps aux --sort=-%mem | head -10

# PM2 memory usage
pm2 monit
```

#### CPU Usage
```bash
# CPU usage
top
htop

# CPU usage by process
ps aux --sort=-%cpu | head -10
```

#### Disk Usage
```bash
# Disk usage
df -h

# Directory sizes
du -sh /opt/eccentric-car-meta/*
du -sh /opt/eccentric-car-meta/uploads/*

# Find large files
find /opt/eccentric-car-meta -type f -size +100M -exec ls -lh {} \;
```

## Performance Monitoring

### 1. Application Metrics

#### Response Times
```bash
# Test API response time
time curl -s http://localhost:3001/api/health

# Test search performance
time curl -s -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "red sports car"}'
```

#### Database Performance
```bash
# SQLite database size
ls -lh /opt/eccentric-car-meta/backend/database.sqlite

# Weaviate statistics
curl -s http://localhost:8080/v1/meta | jq
```

### 2. Load Testing

#### Simple Load Test
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test frontend
ab -n 100 -c 10 http://localhost:3000/

# Test API
ab -n 50 -c 5 -p search.json -T application/json http://localhost:3001/api/search
```

Create `search.json`:
```json
{"query": "red sports car"}
```

## Maintenance Tasks

### 1. Daily Tasks

#### Check Service Status
```bash
#!/bin/bash
# daily-health-check.sh

echo "=== Daily Health Check $(date) ==="

# Check PM2 processes
echo "PM2 Status:"
pm2 status

# Check Docker containers
echo "Docker Status:"
docker ps

# Check disk space
echo "Disk Usage:"
df -h

# Check memory
echo "Memory Usage:"
free -h

# Check logs for errors
echo "Recent Errors:"
grep -i error /var/log/pm2/car-meta-*.log | tail -5

echo "=== Health Check Complete ==="
```

### 2. Weekly Tasks

#### Log Rotation
```bash
# Configure logrotate for PM2 logs
sudo nano /etc/logrotate.d/pm2
```

Add:
```
/var/log/pm2/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### Database Maintenance
```bash
# SQLite maintenance
sqlite3 /opt/eccentric-car-meta/backend/database.sqlite "VACUUM;"

# Check database integrity
sqlite3 /opt/eccentric-car-meta/backend/database.sqlite "PRAGMA integrity_check;"
```

### 3. Monthly Tasks

#### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages (if needed)
cd /opt/eccentric-car-meta
npm audit fix

# Update Docker images
docker-compose pull
```

#### Performance Review
```bash
# Generate performance report
echo "=== Monthly Performance Report $(date) ==="

# System resources
echo "System Resources:"
free -h
df -h

# Application metrics
echo "Application Metrics:"
pm2 show car-meta-backend
pm2 show car-meta-frontend

# Database size
echo "Database Size:"
ls -lh /opt/eccentric-car-meta/backend/database.sqlite

# Upload directory size
echo "Uploads Size:"
du -sh /opt/eccentric-car-meta/uploads

echo "=== Report Complete ==="
```

## Troubleshooting

### 1. Common Issues

#### High Memory Usage
```bash
# Check memory usage
free -h
pm2 monit

# Restart services if needed
pm2 restart all

# Check for memory leaks
ps aux --sort=-%mem | head -10
```

#### Slow Response Times
```bash
# Check CPU usage
top
htop

# Check disk I/O
iostat -x 1

# Check network connections
netstat -tulpn | grep :3001
netstat -tulpn | grep :3000
```

#### Service Crashes
```bash
# Check PM2 logs
pm2 logs --err

# Check system logs
sudo journalctl -u nginx -n 50
sudo journalctl -u docker -n 50

# Restart services
pm2 restart all
docker-compose restart
```

### 2. Emergency Procedures

#### Complete System Restart
```bash
# Stop all services
pm2 stop all
docker-compose down

# Start services in order
docker-compose up -d weaviate
sleep 30
pm2 start ecosystem.config.js
```

#### Database Recovery
```bash
# Backup current database
cp /opt/eccentric-car-meta/backend/database.sqlite /opt/eccentric-car-meta/backend/database.sqlite.backup

# Restore from backup
cp /opt/backups/car-meta/database_YYYYMMDD_HHMMSS.sqlite /opt/eccentric-car-meta/backend/database.sqlite

# Restart backend
pm2 restart car-meta-backend
```

#### Weaviate Recovery
```bash
# Check Weaviate status
docker logs weaviate

# Restart Weaviate
docker-compose restart weaviate

# Wait for startup
sleep 60

# Check if data is accessible
curl -s http://localhost:8080/v1/meta | jq
```

## Monitoring Scripts

### 1. Health Check Script
```bash
#!/bin/bash
# health-check.sh

LOG_FILE="/var/log/health-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log with timestamp
log() {
    echo "[$DATE] $1" | tee -a $LOG_FILE
}

# Check services
log "Starting health check..."

# Check PM2 processes
if pm2 status | grep -q "online"; then
    log "✅ PM2 processes are running"
else
    log "❌ PM2 processes are down"
    pm2 restart all
fi

# Check Docker containers
if docker ps | grep -q "weaviate"; then
    log "✅ Weaviate is running"
else
    log "❌ Weaviate is down"
    docker-compose up -d weaviate
fi

# Check API endpoints
if curl -f -s http://localhost:3001/api/health > /dev/null; then
    log "✅ Backend API is responding"
else
    log "❌ Backend API is not responding"
fi

if curl -f -s http://localhost:3000 > /dev/null; then
    log "✅ Frontend is responding"
else
    log "❌ Frontend is not responding"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    log "⚠️  Disk usage is high: ${DISK_USAGE}%"
else
    log "✅ Disk usage is normal: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 80 ]; then
    log "⚠️  Memory usage is high: ${MEMORY_USAGE}%"
else
    log "✅ Memory usage is normal: ${MEMORY_USAGE}%"
fi

log "Health check completed"
```

### 2. Performance Monitor
```bash
#!/bin/bash
# performance-monitor.sh

LOG_FILE="/var/log/performance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[$DATE] $1" >> $LOG_FILE
}

# Get system metrics
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

# Get application metrics
BACKEND_MEMORY=$(pm2 show car-meta-backend | grep "memory" | awk '{print $4}')
FRONTEND_MEMORY=$(pm2 show car-meta-frontend | grep "memory" | awk '{print $4}')

# Log metrics
log "CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%"
log "Backend Memory: ${BACKEND_MEMORY}, Frontend Memory: ${FRONTEND_MEMORY}"

# Alert if thresholds exceeded
if [ $CPU_USAGE -gt 80 ]; then
    log "ALERT: High CPU usage: ${CPU_USAGE}%"
fi

if [ $MEMORY_USAGE -gt 85 ]; then
    log "ALERT: High memory usage: ${MEMORY_USAGE}%"
fi

if [ $DISK_USAGE -gt 85 ]; then
    log "ALERT: High disk usage: ${DISK_USAGE}%"
fi
```

## Automation

### 1. Cron Jobs
```bash
# Edit crontab
crontab -e

# Add these entries:
# Health check every 5 minutes
*/5 * * * * /opt/eccentric-car-meta/scripts/health-check.sh

# Performance monitoring every hour
0 * * * * /opt/eccentric-car-meta/scripts/performance-monitor.sh

# Daily backup at 2 AM
0 2 * * * /opt/backup-car-meta.sh

# Weekly log cleanup
0 3 * * 0 /opt/eccentric-car-meta/scripts/cleanup-logs.sh
```

### 2. Alerting (Optional)

#### Email Alerts
```bash
# Install mailutils
sudo apt install mailutils

# Configure email alerts in health check script
if [ $MEMORY_USAGE -gt 85 ]; then
    echo "High memory usage: ${MEMORY_USAGE}%" | mail -s "Server Alert" admin@yourdomain.com
fi
```

## Best Practices

1. **Regular Monitoring**: Check service status daily
2. **Log Rotation**: Implement proper log rotation
3. **Backup Strategy**: Daily automated backups
4. **Performance Baselines**: Establish normal performance metrics
5. **Alert Thresholds**: Set appropriate alert levels
6. **Documentation**: Keep troubleshooting procedures updated
7. **Testing**: Regularly test backup and recovery procedures

---

**Remember**: Prevention is better than cure. Regular monitoring and maintenance will help prevent issues before they become critical.
