module.exports = {
  apps: [
    {
      name: 'car-meta-backend',
      script: './backend/src/app.js',
      cwd: '/opt/eccentric-car-meta',
      instances: 2, // Use 2 CPU cores for backend
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/car-meta-backend-error.log',
      out_file: '/var/log/pm2/car-meta-backend-out.log',
      log_file: '/var/log/pm2/car-meta-backend.log',
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
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
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/car-meta-frontend-error.log',
      out_file: '/var/log/pm2/car-meta-frontend-out.log',
      log_file: '/var/log/pm2/car-meta-frontend.log',
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
