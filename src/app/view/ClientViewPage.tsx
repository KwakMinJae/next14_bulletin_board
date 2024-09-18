"use client";

import React, { useState, useEffect } from 'react';
import { Board } from '../../types/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBoardsFromLocalStorage, setBoardsToLocalStorage } from '../../utils/storage';

interface ClientViewPageProps {
  board: Board | null;
}

interface Comment {
  userid: string;
  content: string;
  date: string; // ISO 문자열로 저장
  replies?: Comment[]; // 답글
  id: number; // 댓글/답글의 고유 ID
  replyToId?: number; // 어떤 댓글에 대한 답글인지 식별하기 위한 ID
}

// 랜덤 사용자 ID 생성 함수
const generateRandomUserId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let userId = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    userId += chars[randomIndex];
  }
  return userId;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  return new Intl.DateTimeFormat('ko-KR', options).format(d);
};

const ClientViewPage = ({ board }: ClientViewPageProps) => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState<string | null>(null);
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyToReplyId, setReplyToReplyId] = useState<number | null>(null);
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState<string>('');
  const [editReplyId, setEditReplyId] = useState<number | null>(null); // 추가된 부분
  const [editReplyContent, setEditReplyContent] = useState<string>(''); // 추가된 부분
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const index = board?.index;

  useEffect(() => {
    if (index !== undefined) {
      const storedComments = localStorage.getItem(`comments_${index}`);
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      }
    }
  }, [index]);

  const handleModify = () => {
    if (board) {
      router.push(`/modify?index=${board.index}`);
    }
  };

  const handleDelete = () => {
    if (board) {
      const boards = getBoardsFromLocalStorage();
      boards.splice(board.index, 1);
      boards.forEach((board, i) => (board.index = i)); // Re-indexing
      setBoardsToLocalStorage(boards);
      localStorage.removeItem(`comments_${board.index}`); // Remove comments
      router.push('/');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해 주세요.');
      return;
    }

    const newComment: Comment = {
      userid: generateRandomUserId(),
      content: commentContent,
      date: new Date().toISOString(), // ISO 문자열로 저장
      replies: [],
      id: Date.now(), // 고유 ID 생성
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    if (index !== undefined) {
      localStorage.setItem(`comments_${index}`, JSON.stringify(updatedComments));
    }
    setCommentContent('');
  };

  const handleReplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (replyContent && replyToId !== null) {
      const parentComment = findCommentById(comments, replyToId);
      const replyComment: Comment = {
        userid: generateRandomUserId(),
        content: `${parentComment?.userid} ${replyContent}`, // 부모 댓글의 userid 추가 (콜론 제거)
        date: new Date().toISOString(), // ISO 문자열로 저장
        replies: [],
        id: Date.now(), // 고유 ID 생성
        replyToId
      };

      const newComments = addReplyToComment(comments, replyComment, replyToId);
      setComments(newComments);
      if (index !== undefined) {
        localStorage.setItem(`comments_${index}`, JSON.stringify(newComments));
      }
      setReplyContent('');
      setReplyToId(null); // 답글쓰기 창 닫기
    }
  };

  const handleReplyToReplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (replyContent && replyToReplyId !== null) {
      const parentComment = findCommentById(comments, replyToReplyId);
      const replyComment: Comment = {
        userid: generateRandomUserId(),
        content: `${parentComment?.userid} ${replyContent}`, // 부모 댓글의 userid 추가 (콜론 제거)
        date: new Date().toISOString(), // ISO 문자열로 저장
        replies: [],
        id: Date.now(), // 고유 ID 생성
        replyToId: replyToReplyId
      };

      const newComments = addReplyToComment(comments, replyComment, replyToReplyId);
      setComments(newComments);
      if (index !== undefined) {
        localStorage.setItem(`comments_${index}`, JSON.stringify(newComments));
      }
      setReplyContent('');
      setReplyToReplyId(null); // 답글쓰기 창 닫기
    }
  };

  const handleEditComment = (commentId: number, currentContent: string) => {
    setEditCommentId(commentId);
    setEditCommentContent(currentContent);
  };

  const handleEditReply = (replyId: number, currentContent: string) => { // 추가된 부분
    setEditReplyId(replyId);
    setEditReplyContent(currentContent);
  }; 

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editCommentId !== null) {
      const updatedComments = updateCommentContent(comments, editCommentId, editCommentContent);
      setComments(updatedComments);
      if (index !== undefined) {
        localStorage.setItem(`comments_${index}`, JSON.stringify(updatedComments));
      }
      setEditCommentId(null);
      setEditCommentContent('');
    }
  };

  const handleEditReplySubmit = (e: React.FormEvent<HTMLFormElement>) => { // 추가된 부분
    e.preventDefault();
    if (editReplyId !== null) {
      const updatedComments = updateReplyContent(comments, editReplyId, editReplyContent);
      setComments(updatedComments);
      if (index !== undefined) {
        localStorage.setItem(`comments_${index}`, JSON.stringify(updatedComments));
      }
      setEditReplyId(null);
      setEditReplyContent('');
    }
  }; 

  const handleDeleteComment = (commentId: number) => {
    const updatedComments = deleteCommentById(comments, commentId);
    setComments(updatedComments);
    if (index !== undefined) {
      localStorage.setItem(`comments_${index}`, JSON.stringify(updatedComments));
    }
  };

  const sortedComments = () => {
    return [...comments].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });
  };

  const findCommentById = (commentArray: Comment[], id: number): Comment | undefined => {
    for (const comment of commentArray) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const foundReply = findCommentById(comment.replies, id);
        if (foundReply) return foundReply;
      }
    }
    return undefined;
  };

  const addReplyToComment = (commentArray: Comment[], reply: Comment, parentId: number): Comment[] => {
    return commentArray.map(comment => {
      if (comment.id === parentId) {
        if (!comment.replies) comment.replies = [];
        comment.replies.push(reply);
      } else if (comment.replies) {
        comment.replies = addReplyToComment(comment.replies, reply, parentId);
      }
      return comment;
    });
  };

  const updateCommentContent = (commentArray: Comment[], id: number, newContent: string): Comment[] => {
    return commentArray.map(comment => {
      if (comment.id === id) {
        comment.content = newContent;
      } else if (comment.replies) {
        comment.replies = updateCommentContent(comment.replies, id, newContent);
      }
      return comment;
    });
  };

  const updateReplyContent = (commentArray: Comment[], id: number, newContent: string): Comment[] => { // 추가된 부분
    return commentArray.map(comment => {
      if (comment.replies) {
        comment.replies = updateReplyContent(comment.replies, id, newContent);
        if (comment.replies.find(reply => reply.id === id)) {
          comment.replies = comment.replies.map(reply => {
            if (reply.id === id) {
              reply.content = newContent;
            }
            return reply;
          });
        }
      }
      return comment;
    });
  }; 

  const deleteCommentById = (commentArray: Comment[], id: number): Comment[] => {
    return commentArray.filter(comment => {
      if (comment.id === id) return false;
      if (comment.replies) comment.replies = deleteCommentById(comment.replies, id);
      return true;
    });
  };

  const renderReplies = (replies: Comment[], level: number) => (
    <ul style={{ paddingLeft: level === 1 ? '20px' : '0px' }}>
      {replies.map(reply => (
        <li key={reply.id} style={{ marginBottom: '10px' }}>
          {editReplyId === reply.id ? ( // 수정 폼 렌더링
            <form onSubmit={handleEditReplySubmit}>
              <textarea
                value={editReplyContent}
                onChange={(e) => setEditReplyContent(e.target.value)}
                placeholder="답글을 입력하세요"
                style={{ width: '100%', height: '60px' }}
              ></textarea>
              <button type="submit">수정 완료</button>
              <button type="button" onClick={() => { setEditReplyId(null); setEditReplyContent(''); }}>취소</button>
            </form>
          ) : (
            <>
              <div><strong>{reply.userid}</strong></div>
              <div>{reply.content}</div>
              <div>{formatDate(reply.date)}</div>
              <button onClick={() => handleEditReply(reply.id, reply.content)}>수정</button> {/* 수정 버튼 추가 */}
              <button onClick={() => handleDeleteComment(reply.id)}>삭제</button>
              <button onClick={() => setReplyToReplyId(replyToReplyId === reply.id ? null : reply.id)}>
                답글쓰기
              </button>
              {replyToReplyId === reply.id && (
                <form onSubmit={handleReplyToReplySubmit}>
                  <textarea
                    value={replyContent || ''}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="답글을 입력하세요"
                    style={{ width: '100%', height: '60px' }}
                  ></textarea>
                  <button type="submit">답글 등록</button>
                  <button type="button" onClick={() => setReplyToReplyId(null)}>취소</button>
                </form>
              )}
              {reply.replies && renderReplies(reply.replies, level + 1)}
            </>
          )}
        </li>
      ))}
    </ul>
  );

  const renderAttachments = (attachments: string[]) => {
    return attachments.map((attachment, index) => {
      const isImage = attachment.match(/\.(jpeg|jpg|gif|png)$/i);
      const isVideo = attachment.match(/\.(mp4|webm|ogg)$/i);
      const isPDF = attachment.match(/\.pdf$/i);  // PDF 처리
      const isOther = !isImage && !isVideo && !isPDF;
  
      if (isImage) {
        return (
          <img
            key={index}
            src={attachment}
            alt={`attachment-${index}`}
            style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
          />
        );
      } else if (isVideo) {
        return (
          <video key={index} controls style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}>
            <source src={attachment} type="video/mp4" />
            브라우저가 비디오를 지원하지 않습니다.
          </video>
        );
      } else if (isPDF) {
        return (
          <a key={index} href={attachment} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '10px' }}>
            PDF 파일 열기
          </a>
        );
      } else if (isOther) {
        return (
          <p key={index}>지원하지 않는 파일 형식입니다: {attachment}</p>
        );
      }
    });
  };

  if (!board) return <div>게시글을 찾을 수 없습니다.</div>;

  return (
    <div>
      <h2>작성한 게시글</h2>
      <div>
        <div>
          <strong>제목: </strong> {board.subject}
        </div>
        <div>
          <strong>작성자: </strong> {board.writer}
        </div>
        <div>
          <strong>작성일: </strong> {formatDate(board.date)}
        </div>
        <div>
          <strong>내용: </strong> {board.content}
        </div>
        {board.attachments && board.attachments.length > 0 ? (
  <div>
    <h3>첨부된 파일</h3>
    {renderAttachments(board.attachments)}
  </div>
) : (
  <p>첨부된 파일이 없습니다.</p>
)}
      </div>
      <button type="button" onClick={handleModify}>수정</button>
      <button type="button" onClick={handleDelete}>삭제</button>
      <Link href="/">뒤로가기</Link>

      <div>
        <h3>댓글 ({comments.length})</h3>
        <div>
          <button onClick={() => setSortOrder('newest')}>최신순</button>
          <button onClick={() => setSortOrder('oldest')}>등록순</button>
        </div>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="댓글을 입력하세요"
            style={{ width: '100%', height: '60px' }}
          ></textarea>
          <button type="submit">댓글 등록</button>
        </form>
        <ul style={{ paddingLeft: 0 }}>
          {sortedComments().map(comment => (
            <li key={comment.id} style={{ marginBottom: '20px' }}>
              {editCommentId === comment.id ? (
                <form onSubmit={handleEditSubmit}>
                  <textarea
                    value={editCommentContent}
                    onChange={(e) => setEditCommentContent(e.target.value)}
                    placeholder="댓글을 입력하세요"
                    style={{ width: '100%', height: '60px' }}
                  ></textarea>
                  <button type="submit">수정 완료</button>
                  <button type="button" onClick={() => { setEditCommentId(null); setEditCommentContent(''); }}>취소</button>
                </form>
              ) : (
                <>
                  <div><strong>{comment.userid}</strong></div>
                  <div>{comment.content}</div>
                  <div>{formatDate(comment.date)}</div>
                  <button onClick={() => handleEditComment(comment.id, comment.content)}>수정</button>
                  <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                  <button onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}>
                    답글쓰기
                  </button>
                  {replyToId === comment.id && (
                    <form onSubmit={handleReplySubmit}>
                      <textarea
                        value={replyContent || ''}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 입력하세요"
                        style={{ width: '100%', height: '60px' }}
                      ></textarea>
                      <button type="submit">답글 등록</button>
                      <button type="button" onClick={() => setReplyToId(null)}>취소</button>
                    </form>
                  )}
                  {comment.replies && renderReplies(comment.replies, 1)}
                </>
              )}
              <hr></hr>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClientViewPage;
