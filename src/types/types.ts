export interface Board {
    index: number;
    subject: string;
    writer: string;
    content: string;
    date: string;
    views: number;
    refresh: boolean;
    attachments?: string[];
  }

export type Post = {
  id: number; // 예시로 id가 숫자라고 가정
  title: string; // 제목
  content: string; // 내용
  writer: string; // 작성자
  createdAt: string; // 작성일
};