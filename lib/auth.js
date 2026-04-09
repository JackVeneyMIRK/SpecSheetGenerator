'use strict';
const crypto = require('crypto');

const COOKIE_NAME = 'sg_session';
// Auth bypass is only allowed in non-production environments and must be
// explicitly opted in via the AUTH_BYPASS=true environment variable.
const AUTH_BYPASS =
  process.env.NODE_ENV !== 'production' &&
  process.env.AUTH_BYPASS === 'true';

function getPassword() {
  const pw = process.env.DASHBOARD_PASSWORD;
  if (!pw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DASHBOARD_PASSWORD environment variable must be set in production');
    }
    return 'changeme';
  }
  return pw;
}

function getSessionToken() {
  return crypto.createHash('sha256').update(getPassword()).digest('hex');
}

function isValidPassword(value) {
  if (AUTH_BYPASS) return true;
  return value === getPassword();
}

module.exports = {
  AUTH_BYPASS,
  COOKIE_NAME,
  getSessionToken,
  isValidPassword,
};
