import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connect from '../../../lib/mongoose';
import User from '../../../models/User';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  callbacks: {
    // After a successful sign in, ensure a corresponding user document exists
    async signIn({ user, account, profile }) {
      // user contains { name, email, image }
      try {
        await connect();
        // Upsert the user record in our Users collection. For OAuth users we don't set a passwordHash.
        await User.findOneAndUpdate(
          { email: user.email },
          { $setOnInsert: { email: user.email, boxes: [], lastUpdateDate: null } },
          { upsert: true }
        );
        return true;
      } catch (err) {
        console.error('NextAuth signIn error:', err);
        return false;
      }
    },
    // Provide session object to client if needed
    async session({ session, token }) {
      // session.user contains name, email, image
      return session;
    }
    ,
    async redirect({ url, baseUrl }) {
      // Always redirect to baseUrl (home) by default after sign in
      try {
        if (url.startsWith('/')) return `${baseUrl}${url}`;
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch (e) {
        // ignore and fallthrough
      }
      return baseUrl;
    }
  }
});
