const bcrypt = require('bcryptjs');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id}, process.env.JWT_SECRET, { expiresIn: '30d'});

};

// register a new user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User.create({ name, email, password: hashedPassword });
        if (user) {

            // generate a mock OTP

            const otp = Math.floor(100000 + Math.random() * 900000);

            // send welcome email with OTP (mocked)
            const message = ` 
            Welcome to ShopNest, ${name}! Thank you for registering.
            Your OTP for account verification is: ${otp}`;

            await sendEmail(email, 'Welcome to ShopNest - Your OTP for Registration', message);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)

            });
        }
        else {
            res.status(400).json({ message: `Invalid user data`});
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// login a user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))){
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({
                message: 'invalid email or password'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        });
    }
       
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Exclude password field
        res.json(users);

    } catch (error) {
        res.status(500).json({ message: 'Server error'});
    }

};

module.exports = { registerUser, loginUser, getUsers };

