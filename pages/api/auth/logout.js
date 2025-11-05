export default function handler(req, res) {
  const secure = process.env.NODE_ENV === 'production';
  const cookie = `token=deleted; Path=/; HttpOnly; Max-Age=0; SameSite=Strict${secure ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', cookie);
  res.json({ message: 'Logged out' });
}
