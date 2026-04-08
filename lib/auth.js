'use strict';
const crypto = require('crypto');

const COOKIE_NAME = 'sg_session';

function getPassword() {
  return process.env.DASHBOARD_PASSWORD || 'changeme';
}

function getSessionToken() {
  return crypto.createHash('sha256').update(getPassword()).digest('hex');
}

function isValidPassword(value) {
  return value === getPassword();
}

module.exports = {
  COOKIE_NAME,
  getSessionToken,
  isValidPassword,
};
