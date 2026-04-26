# Deployment Guide - Loop & Bloom API

## Table of Contents

1. [Local Development](#local-development)
2. [Deploy to Render](#deploy-to-render)
3. [Deploy to Railway](#deploy-to-railway)
4. [Deploy to AWS](#deploy-to-aws)
5. [Production Checklist](#production-checklist)

---

## Local Development

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone <repo>
cd backend

# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d

# Seed database (optional)
docker-compose exec backend python scripts/seed_db.py

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

**Access Points:**

- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- MongoDB: localhost:27017 (user: admin, pass: password123)

### Option 2: Local Python

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with MongoDB connection string

# Run server
python scripts/seed_db.py  # Optional: seed sample data
uvicorn app.main:app --reload
```

---

## Deploy to Render

### Step 1: Prepare Repository

Ensure your GitHub repo structure:

```
knit-ai-dream-main/
├── backend/           # This folder
│   ├── app/
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ...
├── src/               # Frontend
└── ...
```

### Step 2: Create MongoDB on MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (free tier available)
4. Create database user with strong password
5. Whitelist IP (or use 0.0.0.0/0)
6. Copy connection string: `mongodb+srv://user:password@cluster.mongodb.net/crochet_db`

### Step 3: Deploy Backend on Render

1. **Create Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select repo (if not listed, click "Configure account")

2. **Configure Service**
   - **Name:** `loop-bloom-api`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3.11
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**

   ```
   DEBUG=False
   ENVIRONMENT=production
   MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/crochet_db
   DATABASE_NAME=crochet_db
   SECRET_KEY=<generate-strong-random-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   OPENAI_API_KEY=sk-your-key
   AI_PROVIDER=openai
   FRONTEND_URL=https://your-frontend.vercel.app
   ADMIN_FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Generate Strong Secret Key**

   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (~2-3 minutes)
   - Copy API URL: `https://loop-bloom-api.onrender.com`

### Step 4: Initialize Database

```bash
# SSH into Render and seed data
curl -X POST https://loop-bloom-api.onrender.com/api/admin/init-db \
  -H "Authorization: Bearer <admin-token>"
```

Or run locally:

```bash
MONGODB_URL=<your-production-url> python scripts/seed_db.py
```

### Step 5: Test Deployment

```bash
# Test health
curl https://loop-bloom-api.onrender.com/health

# Test API docs
# Visit https://loop-bloom-api.onrender.com/docs
```

---

## Deploy to Railway

### Step 1: Create Railway Account

- Go to https://railway.app
- Sign up with GitHub

### Step 2: Create New Project

1. Click "New Project"
2. Select "GitHub Repo" or "Deploy from GitHub"
3. Select your repository

### Step 3: Add MongoDB Service

1. Click "New"
2. Select "Database"
3. Choose "MongoDB"
4. Create MongoDB instance

### Step 4: Configure Backend Service

1. Click "New"
2. Select "GitHub Repo"
3. Configure:
   - **Root Directory:** `backend`
   - **Environment:** Python 3.11

### Step 5: Set Environment Variables

In Railway Dashboard → Variables:

```
DEBUG=False
ENVIRONMENT=production
MONGODB_URL=${{Mongo.MONGODB_URL}}
DATABASE_NAME=crochet_db
SECRET_KEY=<generate-strong-key>
OPENAI_API_KEY=sk-your-key
FRONTEND_URL=https://your-frontend.railway.app
```

### Step 6: Deploy

- Click "Deploy"
- Railway auto-deploys on GitHub push
- View logs in dashboard

---

## Deploy to AWS

### Option 1: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p python-3.11 loop-bloom-api --region us-east-1

# Create environment
eb create production

# Set environment variables
eb setenv MONGODB_URL=mongodb+srv://... SECRET_KEY=...

# Deploy
eb deploy

# Open application
eb open
```

### Option 2: AWS ECR + ECS

```bash
# Build Docker image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t loop-bloom-api .
docker tag loop-bloom-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/loop-bloom-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/loop-bloom-api:latest

# Create ECS task definition, service, and cluster in AWS Console
```

---

## Production Checklist

### Security

- [ ] Change `SECRET_KEY` to strong random value
- [ ] Set `DEBUG=False`
- [ ] Set `ENVIRONMENT=production`
- [ ] Use HTTPS everywhere
- [ ] Enable CORS only for your domain
- [ ] Rotate JWT tokens regularly
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB IP whitelist
- [ ] Use strong database passwords
- [ ] Set up API rate limiting

### Performance

- [ ] Enable database indexing
- [ ] Set up caching (Redis optional)
- [ ] Enable GZIP compression
- [ ] Use CDN for static assets
- [ ] Set up monitoring/logging
- [ ] Test under load

### Reliability

- [ ] Set up database backups
- [ ] Configure health checks
- [ ] Set up alerting
- [ ] Use auto-scaling
- [ ] Implement error tracking (Sentry)
- [ ] Test disaster recovery

### Monitoring & Logging

```python
# Add to app/main.py for production monitoring
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

if not DEBUG:
    sentry_sdk.init(
        dsn="your-sentry-dsn",
        integrations=[FastApiIntegration()]
    )
```

### API Rate Limiting

```python
# Install slowapi
pip install slowapi

# Add to app/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

### Database Backups

MongoDB Atlas: Automatic backups included in free tier

- Monthly backups retained for 12 months
- Create manual backups before major changes

### Monitoring Dashboard

- **Render:** Built-in monitoring
- **Railway:** Built-in metrics
- **Optional:** Datadog, New Relic, Sentry

---

## Troubleshooting

### Connection Timeout

```
Problem: Can't connect to MongoDB
Solution:
1. Check MONGODB_URL format
2. Verify IP whitelist on MongoDB Atlas
3. Test with: mongosh "$MONGODB_URL"
```

### 401 Unauthorized

```
Problem: Auth failures on deployed API
Solution:
1. Verify SECRET_KEY is set correctly
2. Check token not expired
3. Use /docs to test with UI
```

### Memory Issues

```
Problem: OOM kills on Render/Railway
Solution:
1. Upgrade plan to get more RAM
2. Optimize database queries
3. Use connection pooling
```

### Slow Responses

```
Problem: API responding slowly
Solution:
1. Add database indexes
2. Enable response caching
3. Optimize AI generation
4. Check API rate limits
```

---

## Next Steps

1. **Monitor Performance:** Set up dashboard
2. **Configure Alerts:** Email/Slack notifications
3. **Schedule Backups:** Daily automated backups
4. **Set Up CI/CD:** GitHub Actions (included in `.github/workflows/`)
5. **Document API:** Share `/docs` with team

---

## Support

For deployment issues:

1. Check service logs
2. Review environment variables
3. Test database connection
4. Check CORS configuration
5. Open GitHub issue if stuck
