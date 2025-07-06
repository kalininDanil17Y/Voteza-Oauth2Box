const express = require('express');
const bodyParser = require('body-parser');
const { PORT } = require('./config');
const path = require('path');

const authorizeRoute = require('./routes/authorize');
const tokenRoute = require('./routes/token');
const userinfoRoute = require('./routes/userinfo');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const codes = new Map();

app.use('/static', express.static(path.join(__dirname, '../assets')));
app.use('/authorize', authorizeRoute(codes));
app.use('/token', tokenRoute(codes));
app.use('/userinfo', userinfoRoute);

app.listen(PORT, () => console.log(`Mock OAuth2 playground: http://localhost:${PORT}`));
