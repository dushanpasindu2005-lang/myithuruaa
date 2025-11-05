import connect from '../../../lib/mongoose';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (process.env.NODE_ENV === 'production') return res.status(404).end();
  if (req.method !== 'GET') return res.status(405).end();

  await connect();
  const users = await User.find({}, { email: 1 }).lean();
  // return only non-sensitive info
  return res.json({ users: users.map(u => ({ id: u._id, email: u.email })) });
}
