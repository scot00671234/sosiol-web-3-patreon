# Deployment Guide for Sosiol

This guide covers various deployment options for the Sosiol platform.

## Table of Contents
1. [Quick Start with Docker](#quick-start-with-docker)
2. [VPS Deployment with nixpacks](#vps-deployment-with-nixpacks)
3. [Railway Deployment](#railway-deployment)
4. [Render Deployment](#render-deployment)
5. [Manual VPS Deployment](#manual-vps-deployment)
6. [Environment Variables](#environment-variables)

---

## Quick Start with Docker

The easiest way to run Sosiol locally or on a VPS.

### Prerequisites
- Docker and Docker Compose installed
- At least 2GB RAM

### Steps

```bash
# Clone the repository
git clone <your-repo-url>
cd sosiol

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Access the app at http://localhost:5000
```

The Docker setup includes:
- PostgreSQL database
- Backend API + Frontend (served from backend)

### Stop Services
```bash
docker-compose down
```

---

## VPS Deployment with nixpacks

Sosiol is configured with `nixpacks.toml` for easy deployment on platforms like Railway, Render, or any VPS that supports nixpacks.

### Prerequisites
- VPS with Ubuntu 20.04+ or similar
- Domain name (optional but recommended)
- MongoDB (hosted or local)

### Steps

1. **Install nixpacks**
```bash
curl -fsSL https://nixpacks.com/install.sh | bash
```

2. **Clone repository**
```bash
git clone <your-repo-url>
cd sosiol
```

3. **Set environment variables**
```bash
# Copy and edit production env
cp .env.production backend/.env
nano backend/.env  # Edit with your values
```

4. **Build with nixpacks**
```bash
nixpacks build . --name sosiol
```

5. **Run container**
```bash
docker run -p 5000:5000 \
  --env-file backend/.env \
  sosiol
```

---

## Railway Deployment

Railway provides the easiest deployment experience.

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Deploy on Railway**
- Go to [Railway](https://railway.app)
- Click "New Project" → "Deploy from GitHub repo"
- Select your repository
- Railway will automatically detect `nixpacks.toml` and build

3. **Add PostgreSQL**
- Add a PostgreSQL plugin/service (or Neon/Supabase URL)
- Copy the connection string

4. **Set Environment Variables**
- Go to your service settings
- Add variables from `.env.production`
- Update `MONGODB_URI` with Railway's MongoDB URL
- Update `CORS_ORIGIN` with your Railway domain

5. **Deploy**
- Railway will automatically deploy
- Access your app at the provided Railway domain

### Custom Domain
- Go to Settings → Domains
- Add your custom domain
- Update DNS records as shown

---

## Render Deployment

Render provides free tier for web services.

### Steps

1. **Push to GitHub** (same as Railway)

2. **Create Web Service**
- Go to [Render](https://render.com)
- Click "New" → "Web Service"
- Connect your GitHub repository

3. **Configure Build**
- Build Command: `npm install && npm run build`
- Start Command: `cd backend && npm start`

4. **Add PostgreSQL**
- Create PostgreSQL on Render or use external provider
- Get connection string

5. **Environment Variables**
- Add all variables from `.env.production`
- Update `DATABASE_URL` with Postgres connection string
- Update `CORS_ORIGIN` with Render domain

6. **Deploy**
- Click "Create Web Service"
- Render will build and deploy automatically

---

## Manual VPS Deployment

For full control, deploy on your own VPS (DigitalOcean, Linode, AWS EC2, etc.)

### Prerequisites
- VPS with Ubuntu 20.04+
- Root or sudo access
- Domain name (optional)

### Step-by-Step

#### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> sosiol
cd sosiol
sudo chown -R $USER:$USER .

# Install dependencies
npm install

# Build application
npm run build

# Set up environment
cp .env.production backend/.env
nano backend/.env  # Edit with your values
```

#### 3. Start Application with PM2

```bash
cd backend
pm2 start dist/index.js --name sosiol
pm2 save
pm2 startup  # Follow the instructions to enable on boot
```

#### 4. Set up Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/sosiol
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/sosiol /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Set up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

#### 6. Set up Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Environment Variables

### Backend Variables

Required for production:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/sosiol

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Security
CORS_ORIGIN=https://yourdomain.com
```

### Frontend Variables (Build Time)

These are baked into the frontend during build:

```env
VITE_API_URL=https://yourdomain.com/api
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

---

## Post-Deployment

### Monitor Application

```bash
# View PM2 logs
pm2 logs sosiol

# View PM2 status
pm2 status

# Monitor resources
pm2 monit
```

### Update Application

```bash
cd /var/www/sosiol
git pull
npm install
npm run build
pm2 restart sosiol
```

### Backup MongoDB

```bash
# Create backup
mongodump --db sosiol --out /backup/mongodb/$(date +%Y%m%d)

# Restore backup
mongorestore --db sosiol /backup/mongodb/20250101/sosiol
```

---

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs sosiol

# Check MongoDB status
sudo systemctl status mongod

# Check if port is in use
sudo netstat -tlnp | grep 5000
```

### Database connection issues
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- Ensure MongoDB is accessible (firewall, bind IP)

### Nginx errors
```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Scaling

### Horizontal Scaling
- Use MongoDB Atlas for managed database
- Deploy multiple backend instances behind a load balancer
- Use Redis for session management (if needed)

### Performance
- Use a dedicated Solana RPC node for better performance
- Implement caching with Redis
- Use CDN for static assets
- Enable Nginx caching

---

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Set strong MongoDB password
- [ ] Configure firewall (UFW)
- [ ] Keep system and packages updated
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up automated backups
- [ ] Monitor logs regularly
- [ ] Use rate limiting on API endpoints

---

For support, please open an issue on GitHub.

