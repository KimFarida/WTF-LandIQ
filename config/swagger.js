const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LandIQ API',
      version: '1.0.0',
      description: `
# LandIQ - Soil Health Assessment API

A REST API for assessing agricultural land quality in Nigeria using geospatial soil data and AI-generated explanations.

## Features
- 🌍 Geospatial soil health lookup covering 658 mapping units across Nigeria
- 🤖 AI-powered farmer-friendly explanations via HuggingFace
- 📊 Gold/Silver/Bronze land ratings
- 🔄 Side-by-side land comparison
- 🔐 JWT authentication
- ⏰ 24-hour temporary assessments with save option

## Authentication
Most endpoints require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer YOUR_JWT_ACCESS_TOKEN
\`\`\`

Obtain tokens via \`POST /api/auth/login\` or \`POST /api/auth/register\`.

## SDG Alignment
This project supports **SDG 15: Life on Land** by helping farmers and investors make informed decisions about land use and soil health.

## Tech Stack
- Node.js + Express
- MySQL + Sequelize ORM
- Turf.js (geospatial analysis)
- HuggingFace Inference API (AI explanations)
- JWT authentication
      `.trim(),
      contact: {
        name: 'Paragon Squad - Group 32',
        url: 'https://github.com/kimfarida/WTF-LandIQ.git',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'https://wtf-landiq-production.up.railway.app',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message',
            },
            message: {
              type: 'string',
              example: 'Detailed error description',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            first_name: {
              type: 'string',
            },
            last_name: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Assessment: {
          type: 'object',
          properties: {
            assessment_id: {
              type: 'string',
              format: 'uuid',
            },
            coverage: {
              type: 'string',
              enum: ['exact', 'estimated', 'none'],
            },
            location: {
              type: 'object',
              properties: {
                latitude: { type: 'number', format: 'double' },
                longitude: { type: 'number', format: 'double' },
                area_hectares: { type: 'number', format: 'double' },
              },
            },
            soil_health: {
              type: 'object',
              properties: {
                badge: { type: 'string', enum: ['GOLD', 'SILVER', 'BRONZE'] },
                total_score: { type: 'integer', minimum: 0, maximum: 100 },
                degradation_risk: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
              },
            },
            soil_properties: {
              type: 'object',
              properties: {
                suitability: { type: 'string' },
                drainage: { type: 'string' },
                ph_range: { type: 'string' },
                ph_description: { type: 'string' },
                slope: { type: 'string' },
                soil_texture: { type: 'string' },
                soil_depth: { type: 'string' },
                ecological_zone: { type: 'string' },
                major_crops: { type: 'string' },
              },
            },
            ai_explanation: { type: 'string', nullable: true },
            ai_explanation_status: {
              type: 'string',
              enum: ['pending', 'success', 'failed', 'fallback'],
            },
            is_temporary: { type: 'boolean' },
            expires_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Comparison: {
          type: 'object',
          properties: {
            comparison_id: {
              type: 'string',
              format: 'uuid',
            },
            comparison_name: {
              type: 'string',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            items: {
              type: 'array',
              maxItems: 2,
              items: {
                type: 'object',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and token management',
      },
      {
        name: 'Assessments',
        description: 'Land soil health assessments',
      },
      {
        name: 'Comparisons',
        description: 'Side-by-side land comparison (max 2 parcels)',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;