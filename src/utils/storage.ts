import { Board } from '../types/types';

export const getBoardsFromLocalStorage = (): Board[] => {
    if (typeof window === 'undefined') {
      return [];
    }
    const boardsStr = localStorage.getItem('boards');
    return boardsStr ? JSON.parse(boardsStr) : [];
  };
  
  export const setBoardsToLocalStorage = (boards: Board[]) => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem('boards', JSON.stringify(boards));
};