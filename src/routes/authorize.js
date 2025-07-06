const express = require('express');
const { v4: uuid } = require('uuid');
const { users, findUser, addUser, saveState } = require('../data');
const { loginForm } = require('../templates');
const { ALLOW_CUSTOM_USERS, STRICT_CLIENTS } = require('../config');

module.exports = (codes) => {
    const router = express.Router();

    router.get('/', (req, res) => {
        const { client_id, redirect_uri, state, selected } = req.query;
        if (STRICT_CLIENTS) {
            // TODO: implement client validation
        }
        if (selected) {
            const user = findUser(selected);
            if (!user) return res.status(400).send('Unknown user');
            const code = uuid();
            codes.set(code, { user, client_id });
            return res.redirect(`${redirect_uri}?code=${code}&state=${state || ''}`);
        }
        res.send(loginForm(client_id, redirect_uri, state, users));
    });

    router.post('/', (req, res) => {
        let { email, id, client_id, redirect_uri, state } = req.body;
        if (!email) return res.status(400).send('Email required');
        if (!id) id = uuid();
        let user = findUser(id);
        if (!user) {
            user = { id, email, name: email.split('@')[0] };
            if (ALLOW_CUSTOM_USERS) {
                addUser(user);
                saveState();
            }
        }
        const code = uuid();
        codes.set(code, { user, client_id });
        res.redirect(`${redirect_uri}?code=${code}&state=${state || ''}`);
    });

    return router;
};
