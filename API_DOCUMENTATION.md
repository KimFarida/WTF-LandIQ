# LandIQ API Documentation

**Base URL:** `https://wtf-landiq-production.up.railway.app`

**Interactive Docs:** [https://wtf-landiq-production.up.railway.app/api-docs](https://wtf-landiq-production.up.railway.app/api-docs)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Assessments](#assessments)
3. [Comparisons](#comparisons)
4. [Error Handling](#error-handling)
5. [Rate Limits](#rate-limits)
6. [Testing Guide](#testing-guide)

---

## Authentication

All assessment and comparison endpoints require a valid JWT Bearer token.

### Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone_number": "+2348012345678",
  "password": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "created_at": "2026-02-18T10:30:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Lifespans:**
- Access Token: 15 minutes
- Refresh Token: 7 days

---

### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Assessments

### Create Assessment

**Endpoint:** `POST /api/assessments`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "latitude": 12.9848,
  "longitude": 4.5579,
  "area_hectares": 10.0
}
```

**Validation Rules:**
- `latitude`: -90 to 90
- `longitude`: -180 to 180
- `area_hectares`: > 0

**Response (201) - Exact Match:**
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
    "suitability": "Fairly Highly Suitable with few physical limitation",
    "drainage": "Well Drained",
    "ph_range": "6.2 - 6.2",
    "ph_description": "Slightly Acidic",
    "slope": "0 - 2%",
    "soil_texture": "Sandy Clay",
    "soil_depth": "Deep, Mostly Deep",
    "ecological_zone": "Savannah Soils",
    "major_crops": "Sorghum, Maize, Yam, Cassava, Millet, Upland rice"
  },
  "ai_explanation": null,
  "ai_explanation_status": "pending",
  "is_temporary": true,
  "expires_at": "2026-02-19T12:00:00Z"
}
```

**Response (201) - Estimated (Nearest Neighbor):**
```json
{
  "assessment_id": "...",
  "coverage": "estimated",
  "estimated_note": "No exact match found. Using nearest soil unit 2.3km away.",
  "distance_km": 2.3,
  "location": {...},
  "soil_health": {...},
  "soil_properties": {...},
  "ai_explanation": null,
  "ai_explanation_status": "pending",
  "is_temporary": true,
  "expires_at": "2026-02-19T12:00:00Z"
}
```

**Response (200) - No Coverage (General Advice):**
```json
{
  "assessment_id": null,
  "coverage": "none",
  "message": "No soil dataset coverage for this location. General advice provided.",
  "ai_explanation": "This location is outside our current dataset...",
  "source": "ai_general",
  "is_estimated": true
}
```

**AI Explanation Generation:**
The AI explanation is generated asynchronously in the background. Poll the assessment after 5-10 seconds using `GET /api/assessments/:id` to retrieve it.

---

### List Saved Assessments

**Endpoint:** `GET /api/assessments`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "count": 2,
  "assessments": [
    {
      "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
      "latitude": 12.9848,
      "longitude": 4.5579,
      "area_hectares": 10.0,
      "mapping_unit": "15e",
      "badge": "GOLD",
      "total_score": 100,
      "degradation_risk": "LOW",
      "created_at": "2026-02-18T10:00:00Z"
    },
    {
      "assessment_id": "...",
      "latitude": 13.6246,
      "longitude": 5.0865,
      "area_hectares": 5.5,
      "mapping_unit": "22a",
      "badge": "SILVER",
      "total_score": 46,
      "degradation_risk": "HIGH",
      "created_at": "2026-02-18T09:30:00Z"
    }
  ]
}
```

---

### Get Single Assessment

**Endpoint:** `GET /api/assessments/:id`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
  "location": {
    "latitude": 12.9848,
    "longitude": 4.5579,
    "area_hectares": 10.0
  },
  "mapping_unit": "15e",
  "soil_health": {
    "badge": "GOLD",
    "total_score": 100,
    "degradation_risk": "LOW"
  },
  "soil_properties": {
    "suitability": "Fairly Highly Suitable with few physical limitation",
    "drainage": "Well Drained",
    "ph_range": "6.2 - 6.2",
    "slope": "0 - 2%",
    "soil_texture": "Sandy Clay",
    "soil_depth": "Deep, Mostly Deep",
    "ecological_zone": "Savannah Soils",
    "major_crops": "Sorghum, Maize, Yam, Cassava, Millet, Upland rice"
  },
  "ai_explanation": "VERDICT\nThis is excellent farmland with strong agricultural potential...\n\nWHAT THIS MEANS FOR YOU\nThis land scored 100/100 (Gold rating)...",
  "user_notes": null,
  "is_saved": false,
  "is_temporary": true,
  "expires_at": "2026-02-19T12:00:00Z",
  "created_at": "2026-02-18T12:00:00Z"
}
```

---

### Save Assessment

**Endpoint:** `PATCH /api/assessments/:id/save`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "message": "Assessment saved successfully",
  "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
  "is_saved": true
}
```

---

### Delete Assessment

**Endpoint:** `DELETE /api/assessments/:id`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "message": "Assessment deleted successfully"
}
```

---

## Comparisons

### Create Comparison

**Endpoint:** `POST /api/comparisons`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "comparison_name": "Kano vs Abuja Farmland"
}
```

**Response (201):**
```json
{
  "comparison_id": "550e8400-e29b-41d4-a716-446655440000",
  "comparison_name": "Kano vs Abuja Farmland",
  "created_at": "2026-02-18T12:00:00Z",
  "items": []
}
```

---

### Add Assessment to Comparison

**Endpoint:** `POST /api/comparisons/:id/items`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "assessment_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response (201):**
```json
{
  "item_id": "...",
  "comparison_id": "550e8400-e29b-41d4-a716-446655440000",
  "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
  "display_order": 1,
  "message": "Assessment added to comparison"
}
```

**Constraints:**
- Maximum 2 assessments per comparison
- Cannot add same assessment twice
- Assessment must belong to the user

---

### Get Comparison

**Endpoint:** `GET /api/comparisons/:id`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "comparison_id": "550e8400-e29b-41d4-a716-446655440000",
  "comparison_name": "Kano vs Abuja Farmland",
  "created_at": "2026-02-18T12:00:00Z",
  "items": [
    {
      "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
      "display_order": 1,
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
      "soil_properties": {...},
      "ai_explanation": "...",
      "user_notes": null
    },
    {
      "assessment_id": "789e4567-e89b-12d3-a456-426614174111",
      "display_order": 2,
      "location": {
        "latitude": 13.6246,
        "longitude": 5.0865,
        "area_hectares": 5.5
      },
      "soil_health": {
        "badge": "SILVER",
        "total_score": 46,
        "degradation_risk": "HIGH"
      },
      "soil_properties": {...},
      "ai_explanation": "...",
      "user_notes": null
    }
  ]
}
```

---

### List Comparisons

**Endpoint:** `GET /api/comparisons`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "count": 1,
  "comparisons": [
    {
      "comparison_id": "550e8400-e29b-41d4-a716-446655440000",
      "comparison_name": "Kano vs Abuja Farmland",
      "created_at": "2026-02-18T12:00:00Z",
      "item_count": 2,
      "items": [
        {
          "assessment_id": "123e4567-e89b-12d3-a456-426614174000",
          "latitude": 12.9848,
          "longitude": 4.5579,
          "badge": "GOLD",
          "total_score": 100,
          "display_order": 1
        },
        {
          "assessment_id": "789e4567-e89b-12d3-a456-426614174111",
          "latitude": 13.6246,
          "longitude": 5.0865,
          "badge": "SILVER",
          "total_score": 46,
          "display_order": 2
        }
      ]
    }
  ]
}
```

---

### Remove Assessment from Comparison

**Endpoint:** `DELETE /api/comparisons/:id/items/:itemId`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "message": "Item removed from comparison"
}
```

---

### Delete Comparison

**Endpoint:** `DELETE /api/comparisons/:id`

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "message": "Comparison deleted successfully"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error description"
}
```

### Common Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| All API endpoints | 100 requests per 15 minutes |
| `POST /api/assessments` | 20 requests per 15 minutes |

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1645181400
```

---

## Testing Guide

### Test Coordinates (Nigeria)

| Location | Lat | Lon | Expected Badge |
|----------|-----|-----|----------------|
| Kano (GOLD) | 12.9848 | 4.5579 | GOLD |
| Katsina (SILVER) | 13.6246 | 5.0865 | SILVER |
| Jos (BRONZE) | 10.7297 | 9.6929 | BRONZE |
| Gap Area (Estimated) | 9.5 | 6.8 | Estimated |
| Outside Nigeria | 4.0511 | 9.7679 | General advice |

### Full Test Flow

```bash
# 1. Register
curl -X POST https://wtf-landiq-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@landiq.app","password":"Test1234"}'

# 2. Login (save the accessToken)
curl -X POST https://wtf-landiq-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@landiq.app","password":"Test1234"}'

# 3. Create GOLD assessment
curl -X POST https://wtf-landiq-production.up.railway.app/api/assessments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"latitude":12.9848,"longitude":4.5579,"area_hectares":10.0}'

# 4. Wait 5 seconds, poll for AI explanation
curl -X GET https://wtf-landiq-production.up.railway.app/api/assessments/ASSESSMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Save the assessment
curl -X PATCH https://wtf-landiq-production.up.railway.app/api/assessments/ASSESSMENT_ID/save \
  -H "Authorization: Bearer YOUR_TOKEN"

# 6. List saved assessments
curl -X GET https://wtf-landiq-production.up.railway.app/api/assessments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support

For issues or questions:
- GitHub Issues: [https://github.com/kimfarida/landiq-backend/issues](https://github.com/kimfarida/landiq-backend/issues)
- Email: your-email@example.com

---

**Last Updated:** February 18, 2026