# 🌱 LandIQ — Backend API

> AI-powered soil health scoring for agricultural land assessments.  
> Built with **Node.js**, **Express**, **Sequelize**, and **PostgreSQL**.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Data Flow](#data-flow)
- [HuggingFace Model Integration](#huggingface-model-integration)
- [Cron Jobs](#cron-jobs)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)

---

## Project Overview

LandIQ is a mobile-first AgriTech application that helps Nigerian farmers and agricultural SMEs evaluate farmland soil health before acquisition or leasing. Users input land coordinates (via map or manual entry), and the system returns a **Gold / Silver / Bronze** soil health rating powered by AI.

**Aligned SDG:** SDG 15 – Life on Land

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Sequelize |
| Database | MySQL |
| Authentication | JWT (JSON Web Tokens) |
| AI / ML | HuggingFace Inference API |
| Satellite Data | Remote Sensing / NDVI APIs |
| Soil Data | Global Soil Property APIs |
| Weather Data | Climate & Rainfall APIs |
| Mapping | Map Static Image APIs |
| Task Scheduling | node-cron |

---

## Project Structure

```
landiq-backend/
├── config/
│   └── config.js          # Sequelize DB connection
├── controllers/
│   ├── authController.js
│   ├── assessmentController.js
│   ├── scoreController.js
│   └── comparisonController.js
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   └── errorHandler.js
├── models/
│   ├── index.js              # Sequelize model loader
│   ├── User.js
│   ├── LandAssessment.js
│   ├── EnvironmentalData.js
│   ├── SoilHealthScore.js
│   ├── Comparison.js
│   └── ComparisonItem.js
├── routes/
│   ├── authRoutes.js
│   ├── assessmentRoutes.js
│   ├── scoreRoutes.js
│   └── comparisonRoutes.js
├── services/
│   ├── huggingfaceService.js # HuggingFace model calls
│   ├── environmentalService.js # External API data fetching
│   ├── scoringService.js     # Score calculation logic
│   └── mapService.js         # Map snapshot URL generation
├── cron/
│   └── cleanupAssessments.js # 24hr temporary data cleanup
├── utils/
│   └── jwtUtils.js
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/KimFarida/WTF-LandIQ.git


# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
npx sequelize-cli db:migrate

# Start development server
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory. See `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=landiq_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# HuggingFace
HUGGINGFACE_API_KEY=your_huggingface_api_key
HUGGINGFACE_MODEL_ID=your_chosen_model_id

# External APIs
SATELLITE_API_KEY=your_satellite_api_key
SOIL_DATA_API_KEY=your_soil_api_key
WEATHER_API_KEY=your_weather_api_key
MAP_API_KEY=your_map_api_key
```

> ⚠️ Never commit your `.env` file. It is included in `.gitignore`.

---

## Database Setup

LandIQ uses **Sequelize** ORM with **MySQL**.

```bash
# Create the database
npx sequelize-cli db:create

# Run all migrations
npx sequelize-cli db:migrate

# Undo last migration (if needed)
npx sequelize-cli db:migrate:undo

# Seed initial data (e.g. HuggingFace model config)
npx sequelize-cli db:seed:all
```

### Core Models & Relationships

```
USER
 └── has many LAND_ASSESSMENT
       ├── has one ENVIRONMENTAL_DATA
       └── has one SOIL_HEALTH_SCORE

USER
 └── has many COMPARISON
       └── has many COMPARISON_ITEM
             └── belongs to LAND_ASSESSMENT
```

### Temporary Assessment Strategy

Unsaved assessments are stored with:
- `is_temporary = true`
- `expires_at = NOW() + 24 hours`

A cron job runs nightly to purge expired records.  
See [Cron Jobs](#cron-jobs) for details.

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login, returns JWT | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| POST | `/api/auth/logout` | Invalidate refresh token | ✅ |

### Assessments

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/assessments` | Create new land assessment | ✅ |
| GET | `/api/assessments` | Get all saved assessments for user | ✅ |
| GET | `/api/assessments/:id` | Get single assessment | ✅ |
| PATCH | `/api/assessments/:id/save` | Save a temporary assessment | ✅ |
| DELETE | `/api/assessments/:id` | Delete an assessment | ✅ |

### Soil Health Score

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/assessments/:id/score` | Get soil health score for assessment | ✅ |

### Comparisons

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/comparisons` | Create new comparison | ✅ |
| GET | `/api/comparisons` | Get all comparisons for user | ✅ |
| POST | `/api/comparisons/:id/items` | Add land parcel to comparison | ✅ |
| DELETE | `/api/comparisons/:id` | Delete a comparison | ✅ |

---

## Data Flow

When a user submits land coordinates, the following pipeline executes:

```
1. POST /api/assessments
        │
        ▼
2. Create LAND_ASSESSMENT record
   (is_temporary=true, expires_at=+24hrs)
        │
        ▼
3. Fetch map snapshot URL from Map API
        │
        ▼
4. Call HuggingFace Model Pipeline:
   ├── 4a. Fetch environmental data
   │       (NDVI, soil pH, rainfall, temperature, slope...)
   │       → Store in ENVIRONMENTAL_DATA table
   │
   └── 4b. Calculate soil health score
           (weighted algorithm on environmental inputs)
           → Map to Gold / Silver / Bronze
           → Store in SOIL_HEALTH_SCORE table
        │
        ▼
5. Return assessment result to mobile app
        │
        ▼
6. User decision:
   ├── SAVE → is_temporary=false, expires_at=NULL (permanent)
   └── SKIP → record auto-deleted after 24hrs by cron job
```

---

## HuggingFace Model Integration

LandIQ uses a pre-trained HuggingFace model specialized in soil health and environmental analysis.

**Service location:** `services/huggingfaceService.js`

```javascript
// Example usage
const { fetchEnvironmentalData, calculateSoilScore } = require('./services/huggingfaceService');

// Step 1: Fetch environmental indicators for coordinates
const envData = await fetchEnvironmentalData({ latitude, longitude });

// Step 2: Calculate soil health score from environmental data
const score = await calculateSoilScore(envData);
// Returns: { rating: 'Gold', overall_score: 82, vegetation_index: 0.74, ... }
```

**Model config** is stored in the `HUGGINGFACE_MODEL_CONFIG` table, allowing model swapping without code changes.

> 📌 Model selection is in progress. Candidate models will be evaluated from [HuggingFace Hub](https://huggingface.co/models?pipeline_tag=tabular-regression&sort=trending) based on coverage of Nigerian/West African agricultural land data.

---

## Cron Jobs

### Temporary Assessment Cleanup

**File:** `cron/cleanupAssessments.js`  
**Schedule:** Daily at 2:00 AM  
**Purpose:** Deletes unsaved assessments and their related data after 24 hours

```javascript
const cron = require('node-cron');

// Runs daily at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  await LandAssessment.destroy({
    where: {
      is_temporary: true,
      expires_at: { [Op.lt]: new Date() }
    }
  });
});
```

> ⚠️ Ensure `ON DELETE CASCADE` is set on foreign keys in `EnvironmentalData` and `SoilHealthScore` so related records are removed automatically.

---

## Development Roadmap

See full roadmap below 👇

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: your feature description"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request against `main`

### Commit Convention

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `chore:` config/setup changes
- `docs:` documentation updates
- `refactor:` code restructuring

---

*LandIQ – Empowering smarter land decisions for African farmers. 🌍*