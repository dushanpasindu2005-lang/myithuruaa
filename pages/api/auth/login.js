import connect from '../../../lib/mongoose';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function serializeTokenCookie(token) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const secure = process.env.NODE_ENV === 'production';
  return `token=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=Strict${secure ? '; Secure' : ''}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Invalid input' });

  await connect();
  const user = await User.findOne({ email });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[dev] Login attempt for:', email, 'userFound=', !!user);
  }
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (process.env.NODE_ENV !== 'production') {
    console.log('[dev] Password match:', ok);
  }
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.setHeader('Set-Cookie', serializeTokenCookie(token));
  res.json({ message: 'Logged in' });
}
