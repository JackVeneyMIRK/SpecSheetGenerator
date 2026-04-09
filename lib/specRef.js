'use strict';
const crypto = require('crypto');

const SECRET = process.env.SPEC_LINK_SECRET || 'dev-spec-link-secret-change-me';

function sign(payloadBase64) {
  return crypto
    .createHmac('sha256', SECRET)
    .update(payloadBase64)
    .digest('base64url')
    .slice(0, 16);
}

function encodeSpecRef(tenant, unitId) {
  const payload = Buffer.from(
    JSON.stringify({ t: tenant, u: unitId }),
    'utf8'
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decodeSpecRef(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, sig] = parts;
  const expected = sign(payload);
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data?.t || !data?.u) return null;
    return { tenant: data.t, unitId: data.u };
  } catch {
    return null;
  }
}

module.exports = {
  encodeSpecRef,
  decodeSpecRef,
};
