'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

const AuthButton = () => {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <>
          <p>안녕하세요, {session.user.name}</p>
          <button onClick={() => signOut()}>로그아웃</button>
        </>
      ) : (
        <button onClick={() => signIn()}>로그인</button>
      )}
    </div>
  );
};

export default AuthButton;