const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/signup', (req, res, next) => {
    passport.authenticate('signup', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(201).json({ message: 'Signup successful', user });
    })(req, res, next);
});

router.post('/login', (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Authentication error:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (!user) {
            console.error('Authentication failed:', info.message);
            return res.status(400).json({ message: info.message });
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            const token = jwt.sign({ user: { id: user._id, username: user.username } }, 'secret_key');
            return res.json({ token });
        });
    })(req, res, next);
});

module.exports = router;
