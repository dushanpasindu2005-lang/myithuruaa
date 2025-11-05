import connect from '../../../lib/mongoose';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  await connect();
  const existing = await User.findOne({ email });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[dev] Register attempt for:', email, 'existing=', !!existing);
  }
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash: hash, boxes: [], lastUpdateDate: null });
  if (process.env.NODE_ENV !== 'production') {
    console.log('[dev] Created user id=', user._id.toString());
  }
  // do not return passwordHash
  res.status(201).json({ message: 'User created', userId: user._id });
}
