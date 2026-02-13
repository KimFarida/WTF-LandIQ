
const express = require('express');

const app = express();


const db = require('./models/index');
db.sequelize
.sync()
.then(()=>{
    console.log("Database Synced")
})
.catch(err =>{
console.log("Failed to sync db:  " +  err.message);
});


app.get('/', (req, res)=>{
    res.send("HELLO WORLD")
})

app.listen(5000, ()=>{
    console.log("App started")
})

