require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
const ACCESS_TOKEN_TTL = parseInt(process.env.ACCESS_TOKEN_TTL || '3600');
const REFRESH_TOKEN_TTL = parseInt(process.env.REFRESH_TOKEN_TTL || '86400');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const STRICT_CLIENTS = process.env.STRICT_CLIENTS === 'true';
const ALLOW_CUSTOM_USERS = process.env.ALLOW_CUSTOM_USERS !== 'false';

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');

const readJson = (file, fallback) => {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return fallback; }
};
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

let users = readJson(USERS_FILE, [
    { id: '1', email: 'demo@example.com', name: 'Demo User' }
]);
let refreshTokens = readJson(TOKENS_FILE, {});
const saveState = () => { writeJson(USERS_FILE, users); writeJson(TOKENS_FILE, refreshTokens); };

const templates = {
    loginForm: (client_id, redirect_uri, state) => `<!DOCTYPE html><html lang="en"><body>
    <h2>Mock OAuth2 Playground</h2>
    <form method="POST" action="/authorize">
      <input type="hidden" name="client_id" value="${client_id}"/>
      <input type="hidden" name="redirect_uri" value="${redirect_uri}"/>
      <input type="hidden" name="state" value="${state}"/>
      <label>Email: <input name="email" placeholder="user@example.com" required/></label><br/>
      <label>User ID (optional): <input name="id" placeholder="uuid"/></label><br/>
      <button type="submit">Authorize</button>
    </form>
    <h3>Quick users</h3>
    <ul>
      ${users.map(u => `<li><a href="/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&selected=${u.id}">${u.email}</a></li>`).join('')}
    </ul>
  </body></html>`
};

const codes = new Map(); // auth codes in memory

app.get('/authorize', (req, res) => {
    const { client_id, redirect_uri, state, selected } = req.query;
    if (STRICT_CLIENTS) { /* TODO: validate */ }
    if (selected) {
        const user = users.find(u => u.id === selected);
        if (!user) return res.status(400).send('Unknown user');
        const code = uuid();
        codes.set(code, { user, client_id });
        return res.redirect(`${redirect_uri}?code=${code}&state=${state || ''}`);
    }
    res.send(templates.loginForm(client_id, redirect_uri, state));
});

app.post('/authorize', (req, res) => {
    let { email, id, client_id, redirect_uri, state } = req.body;
    if (!email) return res.status(400).send('Email required');
    if (!id) id = uuid();
    let user = users.find(u => u.id === id);
    if (!user) {
        user = { id, email, name: email.split('@')[0] };
        if (ALLOW_CUSTOM_USERS) { users.push(user); saveState(); }
    }
    const code = uuid();
    codes.set(code, { user, client_id });
    res.redirect(`${redirect_uri}?code=${code}&state=${state || ''}`);
});

app.post('/token', (req, res) => {
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

app.get('/userinfo', (req, res) => {
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

app.listen(PORT, () => console.log(`Mock OAuth2 playground: http://localhost:${PORT}`));