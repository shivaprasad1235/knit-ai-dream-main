# Backend Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                             │
│              http://localhost:5173                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS / REST API Calls
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                             │
│              http://localhost:8000                               │
├─────────────────────────────────────────────────────────────────┤
│ Routes Layer                                                      │
│  ├── /api/auth       → Authentication (Register, Login)         │
│  ├── /api/products   → CRUD operations for products             │
│  ├── /api/orders     → Order management                         │
│  ├── /api/designs    → AI design generation                     │
│  └── /api/admin      → Admin dashboard endpoints                │
├─────────────────────────────────────────────────────────────────┤
│ Services Layer                                                    │
│  ├── AuthService     → User authentication & JWT                │
│  └── AIDesignService → AI API integration                       │
├─────────────────────────────────────────────────────────────────┤
│ Data Layer (CRUD)                                                │
│  ├── UserModel                                                   │
│  ├── ProductModel                                                │
│  ├── OrderModel                                                  │
│  └── AIDesignModel                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                   Async Motor Driver
                              │
        ┌─────────────────────────────────────┐
        │      MongoDB                        │
        │  (Cloud or Local)                   │
        │  Collections:                       │
        │  ├── users                          │
        │  ├── products                       │
        │  ├── orders                         │
        │  └── ai_designs                     │
        └─────────────────────────────────────┘
```

## 📁 Detailed Folder Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                          # FastAPI app entry point
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py                  # Register, Login, Get User
│   │       ├── products.py              # GET/POST/PUT/DELETE products
│   │       ├── orders.py                # Create, view, update orders
│   │       ├── designs.py               # Generate & retrieve designs
│   │       └── admin.py                 # Admin dashboard endpoints
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                    # Settings & env variables
│   │   └── security.py                  # JWT tokens & password hashing
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   └── mongodb.py                   # Database connection setup
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py                    # CRUD operations for all entities
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py                   # Pydantic request/response models
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py              # Authentication logic
│   │   └── ai_service.py                # AI design generation logic
│   │
│   └── utils/
│       ├── __init__.py
│       ├── dependencies.py              # FastAPI dependencies (auth guards)
│       └── error_handlers.py            # Global error handling
│
├── tests/                               # Unit tests
│   ├── __init__.py
│   ├── test_security.py                 # JWT & password tests
│   └── test_models.py                   # Database model tests
│
├── scripts/
│   └── seed_db.py                       # Initialize with sample data
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                    # GitHub Actions pipeline
│
├── .env.example                         # Environment template
├── .gitignore                           # Git ignore rules
├── api.http                             # REST client test file
├── Dockerfile                           # Docker image config
├── docker-compose.yml                   # Local dev with services
├── requirements.txt                     # Python dependencies
├── README.md                            # Setup guide
├── DEPLOYMENT.md                        # Deployment instructions
├── start.sh                             # Linux/Mac startup script
└── start.bat                            # Windows startup script
```

## 🔄 Request Flow Example

### 1. User Registration

```
Client                          Backend                         Database
  │                              │                              │
  ├─ POST /api/auth/register ──→ │                              │
  │  {email, password, name}     ├─ Validate input             │
  │                              ├─ Hash password               │
  │                              ├─ Create user record ─────→  │ Insert
  │                              ←───────────────────────────  │
  │ ←─ 201 Created with user ──  │                              │
  │   {id, email, name, admin}   │                              │
```

### 2. AI Design Generation

```
Client                          Backend                    AI Provider
  │                              │                              │
  ├─ POST /api/designs ────────→ │                              │
  │  {prompt, style}             ├─ Auth check                 │
  │                              ├─ Validate prompt             │
  │                              ├─ Create pending record       │
  │                              ├─ Call AI API ─────────────→ │
  │                              │  (OpenAI/Gemini/Claude)      │
  │                              ←──── image_url + description ─|
  │                              ├─ Update record with result   │
  │ ←─ 200 OK with design ──────  │                              │
  │   {id, image, description}   │                              │
```

### 3. Place Order

```
Client                          Backend                    Database
  │                              │                              │
  ├─ POST /api/orders ────────→  │                              │
  │  {items, shipping_address}   ├─ Auth check                 │
  │                              ├─ Validate items             │
  │                              ├─ Calculate total             │
  │                              ├─ Create order record ─────→  │ Insert
  │                              ←───────────────────────────   │
  │ ←─ 201 Created ─────────────  │                              │
  │   {id, total, status}        │                              │
```

## 🔐 Authentication Flow

```
1. Registration
   POST /api/auth/register
   └─→ Hash password → Store in DB → Return user info

2. Login
   POST /api/auth/login
   └─→ Get user → Verify password → Generate JWT tokens → Return tokens

3. Protected Request
   GET /api/orders
   Header: Authorization: Bearer {access_token}
   └─→ Verify token → Extract user_id → Fetch data → Return results

JWT Token Structure:
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567860
}
```

## 📊 Database Schema

### Users Collection

```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "full_name": "John Doe",
  "hashed_password": "bcrypt_hash",
  "is_admin": false,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Products Collection

```json
{
  "_id": ObjectId,
  "name": "Cozy Blanket",
  "description": "Warm crochet blanket",
  "price": 45.99,
  "image_url": "https://...",
  "stock": 10,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Orders Collection

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "items": [
    {
      "product_id": ObjectId,
      "quantity": 1,
      "price": 45.99
    }
  ],
  "total": 45.99,
  "status": "pending",  // pending, in_progress, completed, cancelled
  "shipping_address": "123 Main St...",
  "is_custom": false,
  "custom_design_id": ObjectId,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### AI Designs Collection

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "prompt": "Cloud-shaped mobile...",
  "style": "cute",
  "image_url": "https://...",
  "description": "Product description...",
  "pattern_notes": "Stitch style, yarn weight...",
  "status": "completed",  // pending, completed, failed
  "error_message": null,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

## 🚀 Deployment Targets

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Options                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Local Development              Production                   │
│  ├─ Docker Compose              ├─ Render (recommended)      │
│  ├─ Python venv                 ├─ Railway                   │
│  └─ Local MongoDB               ├─ AWS (Elastic Beanstalk)   │
│                                 ├─ Vercel Functions          │
│                                 └─ Google Cloud Run          │
│                                                               │
│  Database                       CI/CD                        │
│  ├─ MongoDB Atlas               ├─ GitHub Actions            │
│  ├─ MongoDB Community           ├─ Automated tests           │
│  └─ Docker MongoDB              └─ Auto-deploy to Render     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 Frontend Integration

The frontend communicates with backend via REST API:

```typescript
// Example: Frontend API calls
const BASE_URL = "http://localhost:8000/api";

// Auth
fetch(`${BASE_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

// Products
fetch(`${BASE_URL}/products`);

// Orders
fetch(`${BASE_URL}/orders`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(orderData),
});

// AI Design
fetch(`${BASE_URL}/designs`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ prompt }),
});
```

## 📚 API Documentation

**Interactive Docs:** http://localhost:8000/docs (Swagger UI)

**Full Reference:** See [README.md](./README.md)

## 🔍 Key Features

✅ **JWT Authentication** - Secure token-based auth with refresh tokens
✅ **Role-Based Access** - Admin vs regular user permissions
✅ **Error Handling** - Centralized, consistent error responses
✅ **Async/Await** - Non-blocking database operations
✅ **Validation** - Pydantic schemas for input/output validation
✅ **AI Integration** - OpenAI, Gemini, or Claude support
✅ **Logging** - Structured logging for debugging
✅ **Testing** - Unit tests for critical functions
✅ **Docker** - Easy containerization
✅ **CI/CD** - GitHub Actions pipeline

## 🛠️ Development Workflow

```bash
# 1. Start development environment
docker-compose up -d

# 2. Seed sample data
docker-compose exec backend python scripts/seed_db.py

# 3. View API docs
# Open http://localhost:8000/docs

# 4. Test endpoints
# Use api.http with REST Client extension

# 5. Run tests
pytest

# 6. Make changes
# Files auto-reload with --reload flag

# 7. Stop environment
docker-compose down
```

## 📞 Support & Resources

- **Docs:** [FastAPI Docs](https://fastapi.tiangolo.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Deployment:** See DEPLOYMENT.md
- **Issues:** GitHub Issues
