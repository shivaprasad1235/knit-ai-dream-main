# 🎉 Loop & Bloom Backend - Quick Start Guide

Congratulations! Your production-ready FastAPI backend is ready to go!

## ⚡ 5-Minute Setup

### 1. Install & Run (Docker - Recommended)

```bash
cd backend

# Start all services
docker-compose up -d

# Seed sample data
docker-compose exec backend python scripts/seed_db.py

# View logs
docker-compose logs -f backend
```

✅ **Done!** Your API is running at: http://localhost:8000

### 2. Access API

- **Interactive Docs:** http://localhost:8000/docs
- **API Health:** http://localhost:8000/health
- **ReDoc:** http://localhost:8000/redoc

### 3. Test Login

Open http://localhost:8000/docs and try:

```
Email: admin@example.com
Password: admin123
```

## 📋 What's Included

### ✅ Core Features

- **Authentication** - Register, login, JWT tokens
- **Products** - CRUD operations with admin controls
- **Orders** - Create and manage orders
- **AI Designs** - Generate designs with OpenAI/Gemini/Claude
- **Admin Panel** - Dashboard for order & design management

### ✅ Infrastructure

- **Database** - MongoDB with motor async driver
- **Validation** - Pydantic schemas
- **Error Handling** - Centralized exception handlers
- **Security** - Password hashing, JWT tokens, CORS
- **Testing** - Unit tests framework
- **Docker** - Fully containerized setup
- **CI/CD** - GitHub Actions pipeline
- **Logging** - Structured logging

### ✅ Documentation

- **README.md** - Setup and API reference
- **DEPLOYMENT.md** - Deploy to Render, Railway, AWS
- **ARCHITECTURE.md** - System design overview
- **api.http** - REST client test suite

## 🚀 Next Steps

### 1. Configure AI Provider

Edit `.env` to choose your AI provider:

```bash
# OpenAI (Recommended)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key

# OR Google Gemini
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key

# OR Anthropic Claude
AI_PROVIDER=claude
CLAUDE_API_KEY=your-key
```

### 2. Connect Frontend

Update frontend `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

And in your React code:

```typescript
const response = await fetch("http://localhost:8000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

### 3. Deploy Backend

Choose your platform:

- **Render** (Recommended) - See DEPLOYMENT.md
- **Railway** - See DEPLOYMENT.md
- **AWS** - See DEPLOYMENT.md
- **Local** - Already running!

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/routes/          # API endpoints
│   ├── services/            # Business logic
│   ├── models/              # Database CRUD
│   ├── schemas/             # Request/response models
│   ├── core/                # Config & security
│   └── db/                  # MongoDB connection
├── tests/                   # Unit tests
├── scripts/                 # Seed data
├── docker-compose.yml       # Local dev
├── Dockerfile               # Production
├── requirements.txt         # Dependencies
├── README.md                # Documentation
├── DEPLOYMENT.md            # Deploy guide
├── ARCHITECTURE.md          # System design
└── api.http                 # REST tests
```

## 📚 API Endpoints

### Auth

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get tokens
- `GET /api/auth/me` - Current user

### Products

- `GET /api/products` - List products
- `GET /api/products/{id}` - Get one
- `POST /api/products` - Create (admin)
- `PUT /api/products/{id}` - Update (admin)
- `DELETE /api/products/{id}` - Delete (admin)

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/orders/{id}` - Order details

### AI Designs

- `POST /api/designs` - Generate design
- `GET /api/designs` - User's designs
- `GET /api/designs/{id}` - Design details

### Admin

- `GET /api/admin/orders` - All orders
- `GET /api/admin/designs` - All designs
- `GET /api/admin/users` - All users
- `PUT /api/admin/orders/{id}` - Update order

## 🧪 Test Everything

### Option 1: REST Client in VS Code

1. Install "REST Client" extension
2. Open `api.http`
3. Click "Send Request" on any endpoint

### Option 2: cURL

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","full_name":"Test","password":"test123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get products
curl http://localhost:8000/api/products
```

### Option 3: Swagger UI

Visit http://localhost:8000/docs and use the interactive interface!

## 🔧 Common Tasks

### View Database

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh --username admin --password password123

# Use database
use crochet_db

# View collections
db.users.find()
db.products.find()
db.orders.find()
```

### Restart Services

```bash
docker-compose down
docker-compose up -d
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just database
docker-compose logs -f mongodb
```

### Run Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app

# Specific test
pytest tests/test_security.py -v
```

### Add New Endpoint

1. Create function in `app/api/routes/`
2. Define schema in `app/schemas/schemas.py`
3. Import and include router in `app/main.py`
4. Test with Swagger UI

## 🚨 Troubleshooting

### "Connection refused"

```bash
# Check if services are running
docker-compose ps

# Start them
docker-compose up -d
```

### "Database error"

```bash
# Check MongoDB is running
docker-compose logs mongodb

# Restart database
docker-compose restart mongodb
```

### "Port already in use"

```bash
# Find what's using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Change port in docker-compose.yml
# ports:
#   - "8001:8000"  # Changed from 8000
```

## 📖 More Documentation

- **Setup Guide:** [README.md](./README.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Docs:** http://localhost:8000/docs

## 🎯 Development Checklist

- [ ] API running locally (`docker-compose up`)
- [ ] Sample data seeded (`python scripts/seed_db.py`)
- [ ] Tested login with admin account
- [ ] Reviewed ARCHITECTURE.md
- [ ] Connected frontend to backend
- [ ] Configured AI provider
- [ ] Running tests (`pytest`)
- [ ] Deployed to Render/Railway

## 💡 Pro Tips

1. **Use Swagger UI** for testing instead of cURL
2. **REST Client extension** in VS Code is great for development
3. **Check logs** first if something breaks
4. **Environment variables** control everything
5. **MongoDB Atlas** free tier is perfect for testing

## 🎓 Learning Resources

- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com/)
- [JWT Basics](https://jwt.io/introduction)
- [Docker Compose](https://docs.docker.com/compose/)

## ✨ What's Next?

1. ✅ Backend is ready
2. 🔄 Connect frontend
3. 🧪 Run end-to-end tests
4. 🚀 Deploy to production
5. 📊 Set up monitoring

---

**Questions?** Check the docs or open a GitHub issue!

**Ready to code?** Jump into [README.md](./README.md) for detailed setup.

Happy building! 🎉
