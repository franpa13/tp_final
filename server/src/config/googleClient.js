const { OAuth2Client } = require('google-auth-library');
const { GOOGLE_CLIENT_ID } = require('./env');

// Cliente usado únicamente para verificar idTokens de "Sign in with Google"
// (ver authCtrl.google). No hace ningún llamado de red al crearse.
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

module.exports = client;
