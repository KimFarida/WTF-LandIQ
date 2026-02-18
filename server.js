const express = require('express');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');



const db = require('./models/index');
const swaggerSpec = require('./config/swagger');

const { apiLimiter, assessmentLimiter} = require('./middleware/rateLimiter')

const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessment');
const comparisonRoutes = require('./routes/comparison')
const geoLookupService = require('./services/geoLookupService');

const app = express();
app.set('trust proxy', 1); 

// middleware
app.use(express.json());
app.use(cookieParser());

// db startup
db.sequelize
.sync()
.then(()=>{
    console.log("Database Synced")
})
.catch(err =>{
console.log("Failed to sync db:  " +  err.message);
});

// geolookup service startup
try {
  geoLookupService.loadGeoJSON();
  console.log('✅ Geospatial lookup service ready');
} catch (error) {
  console.error('❌ Failed to load GeoJSON:', error.message);
  process.exit(1); // Exit if GeoJSON can't be loaded
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui.topbar { display: none }',
  customSiteTitel: 'LandIQ API Docs',
}))

app.get('/api-docs.json', (req, res)=>{
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec)
})

// Health check for Railway
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});


// MAIN Routes
app.get('/', (req, res)=>{
    res.send("HELLO WORLD")
})

app.use('/api/', apiLimiter)

app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes, assessmentLimiter);
app.use('/api/comparisons', comparisonRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    documentation: '/api-docs',
  });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log(`🌱 LandIQ server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
})
