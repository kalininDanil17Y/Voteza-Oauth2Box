const fs = require('fs');
const path = require('path');

const loginTemplatePath = path.join(__dirname, 'views', 'login.html');
const loginHtml = fs.readFileSync(loginTemplatePath, 'utf8');

function loginForm(clientId, redirectUri, state, users) {
    const userList = users
        .map(u => `<li><a href="/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&selected=${u.id}">${u.email}</a></li>`)
        .join('');
    return loginHtml
        .replace('{{CLIENT_ID}}', clientId)
        .replace('{{REDIRECT_URI}}', redirectUri)
        .replace('{{STATE}}', state)
        .replace('{{USER_LIST}}', userList);
}

module.exports = {
    loginForm
};
