"use client"; // 클라이언트 컴포넌트로 명시

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Board } from '../../types/types';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../../firebaseConfig'; // Firestore 추가
import { recordDate, fileToBase64 } from '@/utils/uttls';
import SweetAlert2 from '../component/sweetalert2';

export default function WritePage() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string | null>(null); 
  
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Firestore에서 유저의 닉네임 가져오기
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setNickname(userDoc.data()?.nickname || null); // Firestore에 저장된 닉네임 설정
        }
      } else {
        setNickname(null);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || []);
  //   // setAttachments(files);

  //   // // Create previews for the files
  //   // const previews = files.map((file) => {
  //   //   return URL.createObjectURL(file);
  //   // });
  //   // setAttachmentPreviews(previews);
  //     // 이미지 또는 비디오만 허용
  //   const validFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));

  //   if (validFiles.length !== files.length) {
  //     setError('이미지 또는 비디오 형식만 첨부할 수 있습니다.');
  //     return;
  //   }

  //   setAttachments(validFiles);

  //   // Create previews for the valid files
  //   const previews = validFiles.map((file) => URL.createObjectURL(file));
  //   setAttachmentPreviews(previews);
  // };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // 이미지 또는 비디오만 허용
    const validFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));

    if (validFiles.length !== files.length) {
      setError('이미지 또는 비디오 형식만 첨부할 수 있습니다.');
      return;
    }

    // 파일을 Base64로 변환하여 미리보기
    try {
      // const previews = await Promise.all(validFiles.map(file => fileToBase64(file)));
      // setAttachments(validFiles);
      // setAttachmentPreviews(previews);
      // setError(null);
      
      const previews = await Promise.all(validFiles.map(file => fileToBase64(file)));
      setAttachments(prev => [...prev, ...validFiles]); // 새로운 파일을 추가
      setAttachmentPreviews(prev => [...prev, ...previews]); // 새로운 미리보기도 추가
      setError(null);
    } catch (err) {
      setError('파일 변환 중 오류가 발생했습니다.');
    }
  };

  // 첨부된 파일 삭제 처리
  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    setAttachmentPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (subject.trim() === '') throw new Error('제목을 입력해주세요');
      if (content.trim() === '') throw new Error('내용을 입력해주세요');
      if (!nickname) throw new Error('로그인된 사용자의 닉네임을 찾을 수 없습니다.');

      const boardsCollection = collection(db, 'boards');
      const indexQuery = await getDocs(boardsCollection);
    
      let maxIndex = 0;
      indexQuery.forEach((doc) => {
        const data = doc.data();
        if (data.index && data.index > maxIndex) {
          maxIndex = data.index;
        }
      });
  
      const newIndex = maxIndex + 1;
      const userId = user?.uid;

      // 새 Board 객체 생성
      const newBoard: Board = {
        index: newIndex,
        userId,
        subject,
        writer: nickname,
        content,
        date: recordDate(),
        views: 0,
        refresh: false,
        attachments: attachmentPreviews,
      };

      // 새로운 게시글 추가 후 로컬스토리지 업데이트
      await addDoc(collection(db, 'boards'), newBoard);

      // 새로 작성된 게시글로 이동
      router.push(`/view?index=${newBoard.index}&writeMode=true`);
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    }
  };

  return (
    <div>
        <div className="bg-gray-100">
          <div className='mx-60'>
              <div className="flex justify-center">
                <div className="pb-8 max-w-3xl w-full">
              <h2 className="text-5xl font-bold text-blue-600/100 flex items-center py-4 my-4">글 쓰기</h2>
              <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='writeTitle' className="font-semibold">
                      제목
                    </label>
                    <input
                      id='writeTitle'
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                    />
                </div>
                <div>
                  {/* <label>
                    작성자:
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setWriter(e.target.value)}
                    />
                    <span>{nickname}</span>
                  </label> */}
                </div>
                <div>
                  <label htmlFor='writeText' className="font-semibold">
                    내용
                  </label>
                    <textarea
                      id='writeText'
                      value={content}
                      className="block w-full h-80 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                      onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <div>
                  <label htmlFor='writeFile' className="font-semibold">
                    사진/동영상 첨부
                  </label>
                  <input
                    id='writeFile'
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  {/* {attachmentPreviews.map((preview, index) => (
                    <div key={index}>
                      {attachments[index].type.startsWith('image') ? (
                        <img src={preview} alt={`attachment-${index}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      ) : (
                        <video src={preview} controls style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      )}
                    </div>
                  ))} */}
                    {attachmentPreviews.map((preview, index) => (
                    <div key={index}>
                      <div className='flex'>
                        <div>
                          {attachments[index].type.startsWith('image') ? (
                            <img src={preview} alt={`attachment-${index}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                          ) : (
                            <video src={preview} controls style={{ maxWidth: '200px', maxHeight: '200px' }} />
                          )}
                        </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAttachment(index)}
                        className="mx-2 w-1/7 h-10 bg-red-500 hover:bg-blue-red text-white font-bold py-2 px-4 rounded-full block text-center my-2 font-semibold text-lg"
                      >
                        삭제
                      </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* {error && <p style={{ color: 'red' }} className="my-4">{error}</p>} */}
                <div>
                    <div className='flex flex-row-reverse'>
                      {error && <p style={{ color: 'red' }} className="my-4">{error}</p>}
                    </div>
                    <div className='flex flex-row-reverse'>
                      <button 
                        type="submit"
                        className="w-1/4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full block text-center my-2 font-semibold text-lg"
                      >
                        글작성
                      </button>
                    </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* <Link href="/">뒤로 가기</Link> */}
    </div>
  );
}
