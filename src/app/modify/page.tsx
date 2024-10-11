"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fileToBase64, recordDate } from '@/utils/uttls';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Board } from '@/types/types';
import LoadingSpinner from '../component/LoadingSpinner';

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
        alert("수정되었습니다.")
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

  if (!board) return <LoadingSpinner/>;

  return (
    <Suspense fallback={<LoadingSpinner />}>
    <div>
      <div className="bg-gray-100">
        <div className='mx-60'>
            <div className="flex justify-center">
              <div className="pb-8 max-w-3xl w-full">
                <h2 className="text-5xl font-bold text-blue-600/100 flex items-center py-4 my-4">글 수정</h2>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor='modifyTitle' className="font-semibold">
                      제목
                    </label>
                    <input 
                      id='modifyTitle'
                      type="text" 
                      value={board.subject} 
                      onChange={(e) => setBoard({ ...board, subject: e.target.value })}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                    />
                  </div>
                  {/* <div>
                    작성자 : <span>{board.writer}</span>
                  </div> */}
                  <div>
                    <label htmlFor='modifyText' className="font-semibold">
                      내용
                    </label>
                    <textarea 
                      id='modifyText'
                      value={board.content} 
                      onChange={(e) => setBoard({ ...board, content: e.target.value })}
                      className="block w-full h-80 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                    />
                  </div>
                  <div>
                    <label htmlFor='modifyFile' className="font-semibold">
                      사진/동영상 첨부
                    </label>
                    <input 
                      id='modifyFile'
                      type="file" 
                      multiple accept="image/*,video/*" 
                      onChange={handleAttachmentChange} 
                      className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                    />
                  </div>
                  <div>
                    {attachments.map((attachment, index) => (
                      <div key={index}>
                        <div className='flex'>
                          <div>
                            {attachment.startsWith('data:video') ? (
                              <video controls width="300">
                                <source src={attachment} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <img src={attachment} alt={`attachment-${index}`} width="300" />
                            )}
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAttachment(attachment)}
                            className="mx-2 w-1/7 h-10 bg-red-500 hover:bg-blue-red text-white font-bold py-2 px-4 rounded-full block text-center my-2 font-semibold text-lg"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='flex flex-row-reverse'>
                    <div className='flex items-center jutfiy-center'>
                      <button 
                        type="submit"
                        className="w-2/4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full block text-center my-2 font-semibold text-lg mx-2"
                      >
                      수정 완료
                      </button>
                      <button 
                        type="button" 
                        onClick={handleBack} 
                        className="w-2/4 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full block text-center my-2 font-semibold text-lg"
                      >
                        수정 취소
                      </button>
                    </div>
                  </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  );
};

export default ModifyPage;