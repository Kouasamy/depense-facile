/**
 * Configuration PM2 pour le serveur email
 * Utilisez: pm2 start ecosystem.config.js
 */

module.exports = {
  apps: [{
    name: 'email-server',
    script: './email-server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      EMAIL_SERVER_PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
}

