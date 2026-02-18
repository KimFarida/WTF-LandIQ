const rateLimit = require('express-rate-limit');


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, //req per IP
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,

})

// stricter limits due to HF token use
const assessmentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20
})

module.exports = {apiLimiter, assessmentLimiter}