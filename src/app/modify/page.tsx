"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fileToBase64, recordDate } from '@/utils/uttls';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Board } from '@/types/types';

const ModifyPage = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const index = searchParams.get('index');

  useEffect(() => {
    const fetchBoard = async () => {
      if (index !== null) {
        const q = query(collection(db, 'boards'), where('index', '==', Number(index)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const boardData = querySnapshot.docs[0].data() as Board;
          setBoard(boardData);
          setAttachments(boardData.attachments || []); // Attachments 설정
        } else {
          console.error('게시글을 찾을 수 없습니다.');
        }
      }
    };

    fetchBoard();
  }, [index]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (board) {
      const updatedBoard = { ...board, date: recordDate(), attachments }; // date 및 attachments 수정
      const q = query(collection(db, 'boards'), where('index', '==', board.index));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const boardRef = doc(db, 'boards', querySnapshot.docs[0].id); // 업데이트할 문서 참조
        await updateDoc(boardRef, updatedBoard); // Firestore에 게시글 업데이트
        router.push(`/view?index=${index}`);
      }
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
          제목 : <input type="text" value={board.subject} onChange={(e) => setBoard({ ...board, subject: e.target.value })} />
        </div>
        <div>
          작성자 : <span>{board.writer}</span>
        </div>
        <div>
          내용 : <textarea value={board.content} onChange={(e) => setBoard({ ...board, content: e.target.value })}></textarea>
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