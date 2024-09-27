import { useSession } from 'next-auth/react';
import { useState } from 'react';

const PostForm = () => {
  const { data: session } = useSession();
  const [subject, setSubject] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (session) {
      const postData = {
        subject,
        writer: session.user.name, // 로그인한 회원의 닉네임
        // 추가 데이터...
      };

      // 서버에 데이터 전송
      await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="제목"
        required
      />
      <button type="submit">게시글 작성</button>
    </form>
  );
};

export default PostForm;
