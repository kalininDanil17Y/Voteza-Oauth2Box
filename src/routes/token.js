const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, JWT_SECRET } = require('../config');
const { refreshTokens, saveState } = require('../data');

module.exports = (codes) => {
    const router = express.Router();

    router.post('/', (req, res) => {
        const { grant_type } = req.body;
        if (grant_type === 'authorization_code') {
            const { code } = req.body;
            const data = codes.get(code);
            if (!data) return res.status(400).json({ error: 'invalid_grant' });
            codes.delete(code);
            const accessToken = jwt.sign(
                { sub: data.user.id, email: data.user.email },
                JWT_SECRET,
                { expiresIn: ACCESS_TOKEN_TTL, issuer: 'mock-oauth' }
            );
            const refreshToken = uuid();
            refreshTokens[refreshToken] = { user: data.user, exp: Date.now() + REFRESH_TOKEN_TTL * 1000 };
            saveState();
            return res.json({
                access_token: accessToken,
                token_type: 'Bearer',
                expires_in: ACCESS_TOKEN_TTL,
                refresh_token: refreshToken
            });
        }
        if (grant_type === 'refresh_token') {
            const { refresh_token } = req.body;
            const record = refreshTokens[refresh_token];
            if (!record || record.exp < Date.now()) return res.status(400).json({ error: 'invalid_grant' });
            const accessToken = jwt.sign(
                { sub: record.user.id, email: record.user.email },
                JWT_SECRET,
                { expiresIn: ACCESS_TOKEN_TTL, issuer: 'mock-oauth' }
            );
            return res.json({ access_token: accessToken, token_type: 'Bearer', expires_in: ACCESS_TOKEN_TTL });
        }
        res.status(400).json({ error: 'unsupported_grant_type' });
    });

    return router;
};
