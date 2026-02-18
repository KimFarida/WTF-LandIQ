# 🌱 LandIQ — Soil Health Assessment API

> **Empowering farmers and land investors in Nigeria with AI-powered soil health insights**

LandIQ is a REST API that provides geospatial soil health assessments using a comprehensive dataset of 658 soil mapping units across Nigeria, combined with AI-generated explanations to help users make informed land acquisition decisions.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

---

## 🚀 Live API

**Production:** [https://wtf-landiq-production.up.railway.app](https://wtf-landiq-production.up.railway.app)

**API Documentation:** [https://wtf-landiq-production.up.railway.app/api-docs](https://wtf-landiq-production.up.railway.app/api-docs)

---

## ✨ Features

- 🌍 **Geospatial Soil Lookup** — 658 pre-mapped soil units covering Nigeria
- 🏅 **Gold/Silver/Bronze Ratings** — Simple soil health classification
- 🤖 **AI-Powered Explanations** — Farmer-friendly advice via HuggingFace
- 📍 **Nearest Neighbor Fallback** — Estimated results for gaps in coverage
- 🔄 **Side-by-Side Comparison** — Compare up to 2 land parcels
- ⏰ **24-Hour Temporary Assessments** — Try before you save
- 🔐 **JWT Authentication** — Secure user accounts
- 📊 **Degradation Risk Assessment** — LOW/MEDIUM/HIGH risk classification

---

## 🎯 SDG Alignment

This project supports [**SDG 15: Life on Land**](https://sdgs.un.org/goals/goal15) by enabling sustainable land use decisions through data-driven soil health insights.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Database | MySQL 8.0 |
| ORM | Sequelize |
| Geospatial | Turf.js |
| AI | HuggingFace Inference API |
| Auth | JWT (jsonwebtoken) |
| Docs | Swagger UI |
| Hosting | Railway |

---

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Login and get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |

### Assessments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/assessments` | Create land assessment | ✅ |
| GET | `/api/assessments` | List saved assessments | ✅ |
| GET | `/api/assessments/:id` | Get assessment details | ✅ |
| PATCH | `/api/assessments/:id/save` | Save temporary assessment | ✅ |
| DELETE | `/api/assessments/:id` | Delete assessment | ✅ |

### Comparisons
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/comparisons` | Create comparison | ✅ |
| GET | `/api/comparisons` | List comparisons | ✅ |
| GET | `/api/comparisons/:id` | Get comparison | ✅ |
| POST | `/api/comparisons/:id/items` | Add assessment (max 2) | ✅ |
| DELETE | `/api/comparisons/:id/items/:itemId` | Remove assessment | ✅ |
| DELETE | `/api/comparisons/:id` | Delete comparison | ✅ |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MySQL 8.0+
- HuggingFace API key ([get one free](https://huggingface.co/settings/tokens))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/landiq-backend.git
cd landiq-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npm run migrate

# Seed soil mapping units (658 records)
npm run seed

# Start development server
npm start
```

Server runs at `http://localhost:3000`

API docs at `http://localhost:3000/api-docs`

---

## 🔐 Environment Variables

```bash
NODE_ENV=development
DATABASE_URL=mysql://user:password@localhost:3306/landiq_dev
HUGGINGFACE_API_KEY=hf_your_key_here
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=3000
```

---

## 📖 Usage Examples

### Create Assessment

```bash
curl -X POST https://wtf-landiq-production.up.railway.app/api/assessments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": 12.9848,
    "longitude": 4.5579,
    "area_hectares": 10.0
  }'
```

**Response:**
```json
{
  "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
  "coverage": "exact",
  "location": {
    "latitude": 12.9848,
    "longitude": 4.5579,
    "area_hectares": 10.0
  },
  "soil_health": {
    "badge": "GOLD",
    "total_score": 100,
    "degradation_risk": "LOW"
  },
  "soil_properties": {
    "suitability": "Fairly Highly Suitable",
    "drainage": "Well Drained",
    "ph_range": "6.2 - 6.2",
    "slope": "0 - 2%",
    "soil_texture": "Sandy Clay",
    "major_crops": "Sorghum, Maize, Yam, Cassava"
  },
  "ai_explanation": null,
  "ai_explanation_status": "pending",
  "is_temporary": true,
  "expires_at": "2026-02-19T12:00:00Z"
}
```

Poll `GET /api/assessments/:id` after ~5 seconds to get the AI explanation.

---

## 🗂️ Project Structure

```
landiq-backend/
├── config/
│   ├── config.js              # Sequelize database config
│   └── swagger.js             # Swagger/OpenAPI config
├── controllers/
│   ├── authController.js
│   ├── assessmentController.js
│   └── comparisonController.js
├── middleware/
│   └── authMiddleware.js      # JWT verification
├── models/
│   ├── index.js
│   ├── user.js
│   ├── soilMappingUnit.js
│   ├── landAssessment.js
│   ├── soilHealthScore.js
│   ├── aiExplanationLog.js
│   ├── comparison.js
│   └── comparisonItem.js
├── routes/
│   ├── authRoutes.js
│   ├── assessmentRoutes.js
│   └── comparisonRoutes.js
├── services/
│   ├── geoLookupService.js    # Turf.js spatial lookup
│   └── aiService.js           # HuggingFace integration
├── migrations/                 # Database migrations
├── seeders/                    # Database seeders
├── data/
│   └── landiq_soil_data.geojson  # 658 soil units
├── server.js                   # Entry point
└── package.json
```

---

## 🧪 Testing

Full testing guide available in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

Test credentials for demo:
```json
{
  "email": "demo@landiq.app",
  "password": "Demo1234"
}
```

---

## 📚 Documentation

- **Interactive API Docs:** [Swagger UI](https://wtf-landiq-production.up.railway.app/api-docs)
- **Full API Reference:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🤝 Contributing

This is a capstone project for **Paragon Squad (Group 32)**. Contributions are welcome after project submission.

### Team Tracks
- Backend Engineering
- Data Science
- Mobile Development (Flutter)
- Product Design
- DevOps
- Cybersecurity

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 👥 Authors

**Paragon Squad - Group 32**

For questions or collaboration: [fariWTF@outlook.com](mailto:fariWTF@outlook.com)

---

## 🙏 Acknowledgments

- Soil dataset provided by Data Analytic Team members
- HuggingFace for AI inference infrastructure
- Railway for hosting platform
- Turf.js for geospatial processing

---

**Built with ❤️ for Nigerian farmers and land investors**