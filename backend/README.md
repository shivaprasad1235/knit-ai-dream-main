# Loop & Bloom API Backend

Production-ready FastAPI backend for the AI-powered crochet marketplace.

## 📋 Features

- ✅ **Authentication**: JWT-based user authentication & registration
- ✅ **Products**: Full product management with admin controls
- ✅ **Orders**: Order creation and status tracking
- ✅ **AI Designs**: Generate custom crochet designs using AI
- ✅ **Admin Panel**: Comprehensive admin endpoints
- ✅ **Error Handling**: Centralized error handling and validation
- ✅ **Database**: MongoDB with async motor driver
- ✅ **Docker**: Fully containerized with docker-compose
- ✅ **CI/CD**: GitHub Actions workflow
- ✅ **CORS**: Pre-configured CORS for frontend

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (recommended)
- MongoDB Atlas account or local MongoDB

### Local Setup (Without Docker)

1. **Clone and install dependencies**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

2. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Run the server**

```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at: http://localhost:8000

### Docker Setup (Recommended)

1. **Configure environment**

```bash
cp .env.example .env
# Edit .env if needed
```

2. **Start services**

```bash
docker-compose up -d
```

MongoDB Admin: `admin:password123` at `localhost:27017`
API: http://localhost:8000

3. **Initialize sample data (optional)**

```bash
docker-compose exec backend python scripts/seed_db.py
```

## 📚 API Documentation

### Interactive API Docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Authentication Endpoints

**Register**

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "securepassword123"
}
```

**Login**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

# Response
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

**Get Current User**

```bash
GET /api/auth/me
Authorization: Bearer {access_token}
```

### Products Endpoints

**Get all products**

```bash
GET /api/products?skip=0&limit=10
```

**Get product by ID**

```bash
GET /api/products/{product_id}
```

**Create product (admin only)**

```bash
POST /api/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Cozy Blanket",
  "description": "Warm and soft crochet blanket",
  "price": 45.99,
  "image_url": "https://example.com/image.jpg",
  "stock": 10
}
```

### Orders Endpoints

**Create order**

```bash
POST /api/orders
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "items": [
    {
      "product_id": "123abc",
      "quantity": 1,
      "price": 45.99
    }
  ],
  "shipping_address": "123 Main St, City, State 12345",
  "is_custom": false
}
```

**Get user orders**

```bash
GET /api/orders
Authorization: Bearer {access_token}
```

**Get order details**

```bash
GET /api/orders/{order_id}
Authorization: Bearer {access_token}
```

### AI Design Endpoints

**Generate design**

```bash
POST /api/designs
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "prompt": "A cloud-shaped baby mobile in pastel pinks",
  "style": "cute"  # optional
}
```

**Get user designs**

```bash
GET /api/designs
Authorization: Bearer {access_token}
```

**Get design by ID**

```bash
GET /api/designs/{design_id}
Authorization: Bearer {access_token}
```

### Admin Endpoints

**Get all orders**

```bash
GET /api/admin/orders
Authorization: Bearer {admin_token}
```

**Get all designs**

```bash
GET /api/admin/designs
Authorization: Bearer {admin_token}
```

**Get all users**

```bash
GET /api/admin/users
Authorization: Bearer {admin_token}
```

**Update order status**

```bash
PUT /api/admin/orders/{order_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "in_progress"
}
```

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py        # Authentication routes
│   │   │   ├── products.py    # Product routes
│   │   │   ├── orders.py      # Order routes
│   │   │   ├── designs.py     # AI design routes
│   │   │   └── admin.py       # Admin routes
│   ├── core/
│   │   ├── config.py          # Settings management
│   │   └── security.py        # JWT & password hashing
│   ├── db/
│   │   └── mongodb.py         # Database connection
│   ├── models/
│   │   └── models.py          # CRUD operations
│   ├── services/
│   │   ├── auth_service.py    # Auth business logic
│   │   └── ai_service.py      # AI generation logic
│   ├── schemas/
│   │   └── schemas.py         # Pydantic schemas
│   └── utils/
│       ├── dependencies.py     # FastAPI dependencies
│       └── error_handlers.py   # Error handling
├── tests/                      # Unit tests
├── .env.example               # Environment template
├── Dockerfile                 # Docker image config
├── docker-compose.yml         # Local dev environment
└── requirements.txt           # Python dependencies
```

## 🔐 Environment Variables

See `.env.example` for all available options:

```env
# App
DEBUG=True
ENVIRONMENT=development

# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/crochet_db
DATABASE_NAME=crochet_db

# JWT
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Provider (openai, gemini, or claude)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py -v
```

## 📦 Deployment

### Deploy to Render

1. **Connect GitHub repository** to Render
2. **Create new Web Service** pointing to `backend/` directory
3. **Add environment variables** from `.env.example`
4. **Set start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Deploy to Railway

1. **Connect GitHub repository**
2. **Add MongoDB plugin**
3. **Set environment variables**
4. Deploy automatically on push

## 🔧 Development

### Create new endpoint

1. **Create route file** in `app/api/routes/`
2. **Define schemas** in `app/schemas/schemas.py`
3. **Add business logic** in `app/services/`
4. **Include router** in `app/main.py`

### Running linter

```bash
pylint app/
flake8 app/
```

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please:

1. Create feature branch
2. Write tests
3. Submit pull request

## 📞 Support

For issues or questions, open a GitHub issue or contact the team.
