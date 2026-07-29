const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getUsers } = require('../controller/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', getUsers);

module.exports = router;