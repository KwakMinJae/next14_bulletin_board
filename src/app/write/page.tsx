"use client"; // 클라이언트 컴포넌트로 명시

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBoardsFromLocalStorage, setBoardsToLocalStorage } from '../../utils/storage';
import { Board } from '../../types/types';
import Link from 'next/link';

// 파일을 Base64로 변환하는 함수
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

export default function WritePage() {
  const [subject, setSubject] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
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
      const previews = await Promise.all(validFiles.map(file => fileToBase64(file)));
      setAttachments(validFiles);
      setAttachmentPreviews(previews);
      setError(null);
    } catch (err) {
      setError('파일 변환 중 오류가 발생했습니다.');
    }
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
        attachments: attachmentPreviews,
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
        <div>
          <label>
            사진/동영상 첨부:
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </label>
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
              {attachments[index].type.startsWith('image') ? (
                <img src={preview} alt={`attachment-${index}`} style={{ maxWidth: '200px', maxHeight: '200px' }} />
              ) : (
                <video src={preview} controls style={{ maxWidth: '200px', maxHeight: '200px' }} />
              )}
            </div>
          ))}
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">글작성</button>
      </form>
      <Link href="/">뒤로 가기</Link>
    </div>
  );
}
