// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";

export const authOptions: any = {
  // Dynamically include only providers with valid credentials
  providers: (() => {
    const prov: any[] = [];
    
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (googleClientId && googleClientSecret) {
      prov.push(
        GoogleProvider({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          authorization: { params: { scope: "openid email profile" } },
        })
      );
    }

    const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
    const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    if (facebookClientId && facebookClientSecret) {
      prov.push(
        FacebookProvider({
          clientId: facebookClientId,
          clientSecret: facebookClientSecret,
          authorization: { params: { scope: "email public_profile" } },
        })
      );
    }

    const githubClientId = process.env.GITHUB_CLIENT_ID;
    const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (githubClientId && githubClientSecret) {
      prov.push(
        GithubProvider({
          clientId: githubClientId,
          clientSecret: githubClientSecret,
          authorization: { params: { scope: "read:user user:email" } },
        })
      );
    }
    return prov;
  })(),
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

// NextAuth v4 App Router pattern: NextAuth() returns the handler directly
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
