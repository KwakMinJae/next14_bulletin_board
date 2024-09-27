"use client";
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Login() {
  const { data: session } = useSession();

  return (
    <div>
      {!session ? (
        <>
          <p>로그인하지 않았습니다.</p>
          <button onClick={() => signIn('github')}>GitHub로 로그인</button>
        </>
      ) : (
        <>
          <p>{session.user?.name}님, 환영합니다!</p>
          <button onClick={() => signOut()}>로그아웃</button>
        </>
      )}
    </div>
  );
}