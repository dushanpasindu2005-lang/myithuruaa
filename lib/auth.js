const jwt = require('jsonwebtoken');
const connect = require('./mongoose');
const User = require('../models/User');

async function getUserFromReq(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    await connect();
    const user = await User.findById(payload.userId).lean();
    return user;
  } catch (err) {
    return null;
  }
}

function parseCookies(cookieHeader) {
  const obj = {};
  if (!cookieHeader) return obj;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [k, ...v] = part.split('=');
    obj[k.trim()] = decodeURIComponent(v.join('='));
  }
  return obj;
}

module.exports = { getUserFromReq };
