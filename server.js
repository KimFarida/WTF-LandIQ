const express = require('express');
const cookieParser = require('cookie-parser');

const db = require('./models/index');

const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessment');

const geoLookupService = require('./services/geoLookupService');

const app = express();

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


// Routes
app.get('/', (req, res)=>{
    res.send("HELLO WORLD")
})
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);

app.listen(5000, ()=>{
    console.log("App started")
})

