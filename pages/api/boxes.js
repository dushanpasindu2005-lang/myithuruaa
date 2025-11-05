import connect from '../../lib/mongoose';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import { getToken } from 'next-auth/jwt';

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

async function getUserFromToken(req) {
  await connect();
  // 1) Try legacy custom JWT stored in `token` cookie
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies.token;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.userId);
      if (user) return user;
    } catch (err) {
      // ignore and fallthrough to next-auth
    }
  }

  // 2) Try NextAuth token (supports Google sign-in)
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
    const nextToken = await getToken({ req, secret });
    if (nextToken) {
      // nextToken usually contains email
      if (nextToken.email) {
        const user = await User.findOne({ email: nextToken.email });
        if (user) return user;
      }
      // fallback: if token.sub contains an id, try that
      if (nextToken.sub) {
        try {
          const user = await User.findById(nextToken.sub);
          if (user) return user;
        } catch (e) {}
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export default async function handler(req, res) {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ message: 'Not authenticated' });

  if (req.method === 'GET') {
    return res.json({ boxes: user.boxes || [], lastUpdateDate: user.lastUpdateDate || null });
  }

  if (req.method === 'POST') {
    const { index, completed } = req.body || {};
    if (typeof index !== 'number' || index < 1 || index > 200) return res.status(400).json({ message: 'Invalid index' });

    const idx = index;
    const arr = new Set(user.boxes.map(Number));
    if (completed) arr.add(idx); else arr.delete(idx);
    user.boxes = Array.from(arr).sort((a,b)=>a-b);
    // update lastUpdateDate if any change; store as toDateString
    user.lastUpdateDate = new Date().toDateString();
    await user.save();
    return res.json({ boxes: user.boxes, lastUpdateDate: user.lastUpdateDate });
  }

  return res.status(405).end();
}
