const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

const readJson = (file, fallback) => {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (_) {
        return fallback;
    }
};

const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

let users = readJson(USERS_FILE, [
    { id: '1', email: 'demo@example.com', name: 'Demo User' },
    { id: '2', email: 'admin@voteza.pro', name: 'Voteza' },
]);
let refreshTokens = readJson(TOKENS_FILE, {});
let clients = readJson(CLIENTS_FILE, []);

const saveState = () => {
    writeJson(USERS_FILE, users);
    writeJson(TOKENS_FILE, refreshTokens);
    // do not overwrite clients file unless clients were changed
};

const findUser = (id) => users.find(u => u.id === id);

const addUser = (user) => {
    users.push(user);
};

const findClient = (id) => clients.find(c => c.id === id);

module.exports = {
    users,
    refreshTokens,
    clients,
    saveState,
    findUser,
    addUser,
    findClient
};
