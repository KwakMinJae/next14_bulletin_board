"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Board } from '../../types/types';
import { getBoardsFromLocalStorage, setBoardsToLocalStorage } from '../../utils/storage';

const ModifyPage = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [subject, setSubject] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const index = searchParams.get('index');

  useEffect(() => {
    if (index) {
      const boards = getBoardsFromLocalStorage();
      const boardData = boards[Number(index)] || null;
      setBoard(boardData);
      if (boardData) {
        setSubject(boardData.subject);
        setWriter(boardData.writer);
        setContent(boardData.content);
      }
    }
  }, [index]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (board) {
      if (!subject || !writer || !content) {
        alert('모든 필드를 입력해 주세요.');
        return;
      }

      const updatedBoard = { ...board, subject, writer, content, date: new Date().toISOString().split('T')[0] };
      const boards = getBoardsFromLocalStorage();
      boards[Number(index)] = updatedBoard;
      setBoardsToLocalStorage(boards);
      router.push(`/view?index=${index}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!board) return <div>게시글을 찾을 수 없습니다.</div>;

  return (
    <div>
      <h2>글 수정</h2>
      <form onSubmit={handleSubmit}>
        <div>
          제목 : <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          작성자 : <input type="text" value={writer} onChange={(e) => setWriter(e.target.value)} />
        </div>
        <div>
          내용 : <textarea value={content} onChange={(e) => setContent(e.target.value)}></textarea>
        </div>
        <input type="submit" value="수정완료" />
      </form>
      <button type="button" onClick={handleBack} style={{ marginTop: '10px' }}>뒤로 가기</button>
    </div>
  );
};

export default ModifyPage;
