const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { users } = require('../data');

const router = express.Router();

router.get('/', (req, res) => {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === payload.sub);
        if (!user) throw new Error('user not found');
        return res.json(user);
    } catch (e) {
        return res.status(401).json({ error: 'invalid_token' });
    }
});

module.exports = router;
