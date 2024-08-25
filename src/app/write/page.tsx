"use client"; // 클라이언트 컴포넌트로 명시

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBoardsFromLocalStorage, setBoardsToLocalStorage } from '../../utils/storage';
import { Board } from '../../types/types';
import Link from 'next/link';

export default function WritePage() {
  const [subject, setSubject] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // 현재 날짜와 시간을 YYYY-MM-DD HH:mm:ss 형식으로 반환
  const recordDate = (): string => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (subject.trim() === '') throw new Error('제목을 입력해주세요');
      if (writer.trim() === '') throw new Error('작성자를 입력해주세요');
      if (content.trim() === '') throw new Error('내용을 입력해주세요');

      const boards = getBoardsFromLocalStorage();

      // 새 Board 객체 생성
      const newBoard: Board = {
        index: boards.length,
        subject,
        writer,
        content,
        date: recordDate(),
        views: 0,
        refresh: false,
      };

      // 새로운 게시글 추가 후 로컬스토리지 업데이트
      setBoardsToLocalStorage([...boards, newBoard]);

      // 새로 작성된 게시글로 이동
      router.push(`/view?index=${newBoard.index}&writeMode=true`);
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    }
  };

  return (
    <div>
      <h2>게시판 쓰기</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            제목:
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            작성자:
            <input
              type="text"
              value={writer}
              onChange={(e) => setWriter(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            내용:
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">글작성</button>
      </form>
      <Link href="/">뒤로 가기</Link>
    </div>
  );
}
