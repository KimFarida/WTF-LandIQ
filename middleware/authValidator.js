const {body, validationResult } = require('express-validator');

const registerRules = [
    body('firstName').trim().notEmpty().withMessage('firstName is required'),
    body('lastName').trim().notEmpty().withMessage('lastName is required'),
    body('email').trim().notEmpty().withMessage('email is required'),
    body('phoneNumber').trim().notEmpty().withMessage('phoneNumber is required'),
    body('password').trim().notEmpty().withMessage('password is required'),

    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({min: 8}).withMessage('Password is too short'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array().map(err => err.msg) 
            });
        }
        next();
    }
]


const loginRules = [

    body('email').notEmpty().withMessage('email is required'),
    body('password').notEmpty().withMessage('password is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
        next();
    }
]

module.exports = {registerRules, loginRules}