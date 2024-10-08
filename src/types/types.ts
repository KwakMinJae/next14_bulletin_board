export interface Board {
    index: number;
    subject: string;
    writer: string;
    content: string;
    date: string;
    views: number;
    refresh: boolean;
    attachments?: string[];
    userId: string | undefined;
  }

export interface Comment {
  userid: string | null;
  content: string;
  date: string; // ISO 문자열로 저장
  replies?: Comment[]; // 답글
  id: number; // 댓글/답글의 고유 ID
  replyToId?: number; // 어떤 댓글에 대한 답글인지 식별하기 위한 ID
  commentUid?: string;
  parentCommentId?: string|null
}

export type Post = {
  id: number; // 예시로 id가 숫자라고 가정
  title: string; // 제목
  content: string; // 내용
  writer: string; // 작성자
  createdAt: string; // 작성일
};