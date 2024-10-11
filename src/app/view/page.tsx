// app/view/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams from 'next/navigation'
import ClientViewPage from './ClientViewPage';
import { getBoardsFromLocalStorage } from '../../utils/storage';
import { db } from '../../../firebaseConfig'; // Firestore 인스턴스
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Board } from '../../types/types';
import LoadingSpinner from '../component/LoadingSpinner';

const ViewPage = () => {
  const searchParams = useSearchParams(); // Access search params
  const [board, setBoard] = useState<Board | null>(null);

  // useEffect(() => {
  //   const index = searchParams.get('index'); // Extract index from search params
  //   console.log(index);
    
  //   if (index !== null) {
  //     const boards: Board[] = getBoardsFromLocalStorage();
  //     const boardData = boards[Number(index)] || null;
  //     setBoard(boardData);
  //   }
  // }, [searchParams]);
  useEffect(() => {
    const fetchBoard = async () => {
      const index = searchParams.get('index');
      if (index !== null) {
        // Firestore에서 해당 게시글 가져오기
        const q = query(collection(db, 'boards'), where('index', '==', Number(index)));
        const querySnapshot = await getDocs(q);
        // console.log(querySnapshot.docs[0].data());
        
        if (!querySnapshot.empty) {
          const boardData = querySnapshot.docs[0].data() as Board;
          setBoard(boardData);
        } else {
          console.error('게시글을 찾을 수 없습니다.');
        }
      }
    };

    fetchBoard();
  }, [searchParams]);
  return (
    // <ClientViewPage board={board} />
    <Suspense fallback={<div><LoadingSpinner/></div>}>
      <ClientViewPage board={board} />
    </Suspense>
  );
};

export default ViewPage;