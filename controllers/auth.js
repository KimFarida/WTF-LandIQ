require("dotenv").config();``
const db = require('../models/index');
const { Op, where } = require('sequelize');
const bycrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFESH_SECRET;


const generateTokens = (user)=>{
    const accessToken = jwt.sign({ id:user.id },JWT_SECRET,{ expiresIn: '15m' })
    const refreshToken = jwt.sign({ id: user.id },JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

const registerUser = async (req, res)=>{
    const t = await db.sequelize.transaction()
    try {
        const {firstName, lastName, email, phoneNumber, password } = req.body;

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
            await t.rollback()
            return res.status(400).json({message: 'A user exists with this email/phone number'})
        }

        const passwordHash = await bycrypt.hash(password, 10);

        // save user in the db 
        const newUser = await db.User.create({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            email: email,
            passwordHash:passwordHash,
        }, { transaction: t});

        const { accessToken, refreshToken } = generateTokens(newUser);
        // TODO hash JWT before saving
        newUser.jwtRefreshToken = refreshToken;

        await newUser.save({ transaction: t});

        await t.commit();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
             secure: true,
              sameSite: 'Strict',
               maxAge: 7 * 24 * 60 * 60 * 1000
        });


        return res.status(201).json({
            message: 'User created sucessfuly!',
            userId: newUser.id,
            token: accessToken
        })
    } catch (error) {
        // Add db rollback on error
        await t.rollback();
        console.log(error);
        return res.status(500).json({ error: 'Failed to create user' });
    }
    
};

const loginUser = async (req, res) =>{
    try {
    // get email and password
    const {email, password} = req.body;

    // check if user of said email
    const user = await db.User.findOne({
            where: { email },
    });

    // If user not found or incorrect password
    if(!user || !bycrypt.compare(password, user.passwordHash)){
        return res.status(400).json({message:'Invalid Login Credentials'})
    }

    // generate access Token, refreesh Token
    const { accessToken, refreshToken } = generateTokens(user);

    // update refreshToken in db
    user.jwtRefreshToken = refreshToken;

    // set cookie
    res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
             secure: true,
              sameSite: 'Strict',
               maxAge: 7 * 24 * 60 * 60 * 1000
        });
    // return token to loggined User
    return res.status(201).json({message: 'User logged in successfully', token: accessToken })
} catch (error) {
        
        console.log(error);
        return res.status(500).json({ error: 'Failed to login user' });
    }
}

const logOutUser = async (req, res) =>{
    try {

        const { id } = req.user;

        const [affectedRows] = await db.User.update(
            { jwtRefreshToken: null },
            {where: { id } }
        );
        
        if (affectedRows == 0){
            return res.status(400).json({ message: 'User not found'});
        }

        return res.status(200).json({message: 'User logged out successfully'})
    }catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to logout user' });
    }
}
module.exports = {registerUser, loginUser, logOutUser};