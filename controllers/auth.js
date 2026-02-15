const db = require('../models/index');
const { Op } = require('sequelize');
const bycrypt = require('bcryptjs')

const registerUser = async (req, res)=>{
    try {
        const {firstName, lastName, email, phoneNumber, password } = req.body;
        console.log(firstName)
        // Check if email or password exists, if so reject
        const user = await db.User.findOne({
            where: {
                [Op.or]: [
                    {email: email},
                    {phoneNumber: phoneNumber}
                ]
            }
        });

        if(user){
            res.send(400).json({message: 'A user exists with this email/phone number'})
        }

        const passwordHash = await bycrypt.hash(password, 10);

        // save user in the db 
        const newUser = await db.User.create({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            email: email,
            passwordHash:passwordHash,
            // create JWT refresh token 
        })

        res.status(201).json({
            message: 'User created sucessfuly!',
            userId: newUser.id
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
    
};

module.exports = {registerUser} 