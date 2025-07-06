require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 8080,
    ACCESS_TOKEN_TTL: parseInt(process.env.ACCESS_TOKEN_TTL || '3600'),
    REFRESH_TOKEN_TTL: parseInt(process.env.REFRESH_TOKEN_TTL || '86400'),
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    STRICT_CLIENTS: process.env.STRICT_CLIENTS === 'true',
    ALLOW_CUSTOM_USERS: process.env.ALLOW_CUSTOM_USERS !== 'false'
};
