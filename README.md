# Sosiol - Web3 Creator Platform

A decentralized creator platform built on Solana, allowing fans to support creators with USDC tips.

## 🚀 Features

- **Wallet Integration**: Connect with Phantom, Slope, and other Solana wallets
- **USDC Payments**: Send tips with USDC stablecoin
- **Creator Profiles**: Customizable profiles with avatars and bios
- **Dashboard**: Real-time analytics for creators
- **Fast & Secure**: Built on Solana for lightning-fast transactions

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- TailwindCSS
- Solana Wallet Adapter
- Vite

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL (via Prisma ORM)
- Solana Web3.js

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+/Docker
- npm or yarn

### Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd sosiol
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Backend (.env in backend/):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sosiol?schema=public
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
CORS_ORIGIN=http://localhost:5173
```

Frontend (.env in frontend/):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

4. **Start PostgreSQL**
```bash
# If using Docker
docker run -d --name sosiol-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sosiol -p 5432:5432 postgres:16-alpine

# Or use your local PostgreSQL installation
```

5. **Run development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:backend  # Backend on port 5000
npm run dev:frontend # Frontend on port 5173
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- PostgreSQL on port 5432
- Backend + Frontend on port 5000

### Using Dockerfile Only

```bash
# Build image
docker build -t sosiol .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://postgres:postgres@your-postgres-host:5432/sosiol?schema=public \
  -e SOLANA_RPC_URL=https://api.mainnet-beta.solana.com \
  sosiol
```

## 🚢 Production Deployment

### VPS Deployment with nixpacks

This project is configured for deployment on platforms that support nixpacks (Railway, Render, etc.)

1. **Push to Git repository**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Railway/Render**
- Connect your repository
- Set environment variables from `.env.production`
- Deploy!

### Manual VPS Deployment

1. **Install Node.js and MongoDB on your VPS**

2. **Clone and build**
```bash
git clone <your-repo-url>
cd sosiol
npm install
npm run build
```

3. **Set up environment variables**
```bash
cp .env.production backend/.env
# Edit backend/.env with your production values
```

4. **Start with PM2**
```bash
npm install -g pm2
cd backend
pm2 start dist/index.js --name sosiol
pm2 save
pm2 startup
```

5. **Set up Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Configuration

### Solana Network

By default, the app connects to Solana mainnet-beta. To use devnet for testing:

1. Update `SOLANA_NETWORK` to `devnet`
2. Update `SOLANA_RPC_URL` to `https://api.devnet.solana.com`
3. Update `USDC_MINT_ADDRESS` to devnet USDC mint

### PostgreSQL

For production, use:
- Managed PostgreSQL (Neon, Supabase, RDS, Railway)
- Or self-hosted PostgreSQL with backups and monitoring

## 📱 Usage

### For Fans

1. Connect your Solana wallet (Phantom/Slope)
2. Browse creators on the Explore page
3. Visit a creator's page
4. Send a tip or subscribe to a tier
5. Confirm the transaction in your wallet

### For Creators

1. Connect your Solana wallet
2. Go to Dashboard
3. Create your profile with username, bio, and avatar
4. Share your creator page link
5. Track tips in your dashboard

## 🔒 Security

- All transactions happen on-chain
- Private keys never leave user's wallet
- Backend verifies transactions on Solana
- Wallet signature verification for profile updates
- CORS protection
- Input validation on all endpoints

## 🧪 Testing

### Testing on Devnet

1. Switch to devnet in `.env` files
2. Get devnet SOL from faucet: https://solfaucet.com/
3. Get devnet USDC from test faucet
4. Test transactions with devnet tokens

## 📊 API Endpoints

### Creators
- `GET /api/creators` - Get all creators
- `GET /api/creators/username/:username` - Get creator by username
- `GET /api/creators/wallet/:walletAddress` - Get creator by wallet
- `POST /api/creators` - Create/update creator profile
- `GET /api/creators/:walletAddress/dashboard` - Get creator dashboard

### Tips
- `POST /api/tips` - Record a tip
- `GET /api/tips/creator/:walletAddress` - Get tips for creator
- `GET /api/tips/fan/:walletAddress` - Get tips from fan


### Transactions
- `GET /api/transactions/:signature` - Get transaction details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Credits

Built with:
- [Solana](https://solana.com/)
- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [TailwindCSS](https://tailwindcss.com/)

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ for the Web3 creator economy

