import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string, // string으로 강제 변환
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // string으로 강제 변환
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      // 세션에 사용자 이름 추가
      if (token) {
        session.user.name = token.name; // 사용자 이름 추가
        session.user.email = token.email; // 사용자 이메일 추가
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      // JWT에 사용자 정보를 추가
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // 비밀키 설정
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };