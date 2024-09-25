"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Board } from '../../types/types';
import { getBoardsFromLocalStorage, setBoardsToLocalStorage } from '../../utils/storage';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ModifyPage = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [subject, setSubject] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
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
        setAttachments(boardData.attachments || []);
      }
    }
  }, [index]);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (board) {
      if (!subject || !writer || !content) {
        alert('모든 필드를 입력해 주세요.');
        return;
      }

      const updatedBoard = { ...board, subject, writer, content, date: recordDate(), attachments };
      const boards = getBoardsFromLocalStorage();
      boards[Number(index)] = updatedBoard;
      setBoardsToLocalStorage(boards);
      router.push(`/view?index=${index}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Base64 변환 후 상태에 저장
    const newAttachments = await Promise.all(
      files.map(file => fileToBase64(file))
    );

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (attachmentToRemove: string) => {
    setAttachments(prev => prev.filter(att => att !== attachmentToRemove));
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
        <div>
          첨부파일 : 
          <input type="file" multiple accept="image/*,video/*" onChange={handleAttachmentChange} />
        </div>
        <div>
          {attachments.map((attachment, index) => (
            <div key={index}>
              {attachment.startsWith('data:video') ? (
                <video controls width="300">
                  <source src={attachment} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img src={attachment} alt={`attachment-${index}`} width="300" />
              )}
              <button type="button" onClick={() => handleRemoveAttachment(attachment)}>삭제</button>
            </div>
          ))}
        </div>
        <input type="submit" value="수정완료" />
      </form>
      <button type="button" onClick={handleBack} style={{ marginTop: '10px' }}>뒤로 가기</button>
    </div>
  );
};

export default ModifyPage;
