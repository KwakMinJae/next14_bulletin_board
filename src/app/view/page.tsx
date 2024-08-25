// app/view/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams from 'next/navigation'
import ClientViewPage from './ClientViewPage';
import { getBoardsFromLocalStorage } from '../../utils/storage';
import { Board } from '../../types/types';

const ViewPage = () => {
  const searchParams = useSearchParams(); // Access search params
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    const index = searchParams.get('index'); // Extract index from search params
    console.log("11",index);
    
    if (index !== null) {
      const boards: Board[] = getBoardsFromLocalStorage();
      const boardData = boards[Number(index)] || null;
      setBoard(boardData);
    }
  }, [searchParams]);

  return (
    <ClientViewPage board={board} />
  );
};

export default ViewPage;