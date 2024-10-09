"use client";

import React, { useState, useEffect } from 'react';
import { Board, Comment } from '../../types/types';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getBoardsFromLocalStorage, setBoardsToLocalStorage } from '../../utils/storage';
import { auth, db } from '../../../firebaseConfig';  // Firestore 인스턴스
import { collection, query, where, getDocs, setDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { formatDate } from '@/utils/uttls';
interface ClientViewPageProps {
  board: Board | null;
}

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
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [boards, setBoards] = useState<Board | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  // console.log(searchParams);
  useEffect(() => {
    const fetchBoard = async () => {
      const index = searchParams.get('index');
      if (index !== null) {
        // Firestore에서 해당 게시글 가져오기
        const q = query(collection(db, 'boards'), where('index', '==', Number(index)));
        const querySnapshot = await getDocs(q);
        const boardData = querySnapshot.docs[0].data() as Board;
        setBoards(boardData);
        // console.log(boardData);
        
      }
    };
    const fetchUser = async () => {
      onAuthStateChanged(auth, async (currentUser) => {
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
      })
    }
    fetchBoard();
    fetchUser();
  },[])

  useEffect(() => {
    const urlIndex = searchParams.get('index');
    const q = query(collection(db, 'boards'), where('index', '==', Number(urlIndex)));
    
    if (index !== undefined) {
      // 새로고침 여부를 확인하기 위한 localStorage 키
      const refreshKey = `board_refresh_${index}`;
      const isRefreshed = localStorage.getItem(refreshKey);

      // writeMode 파라미터를 확인 (글 작성 후 뷰 페이지로 이동하는 경우)
      const writeMode = searchParams.get('writeMode');

      // 조회수 증가 함수
      const incrementViews = async () => {
        if (!writeMode && !isRefreshed) {
          // Firestore에서 현재 게시글을 가져옴
          localStorage.setItem(refreshKey, 'true');
          const querySnapshot = await getDocs(q);

          console.log(querySnapshot);
          querySnapshot.forEach(async (doc) => {
            const boardData = doc.data();
            const boardDocRef = doc.ref;
            boardData.views++;
            
            await updateDoc(boardDocRef, {
              views: boardData.views,
            });
          })
        }
      };

      incrementViews(); // 조회수 증가 함수 호출

      // 페이지가 변경될 때 refreshKey 초기화
      return () => {
        localStorage.removeItem(refreshKey);
      };
    }

    const fetchCommentsFromAllBoards = async () => {
      try {
        const querySnapshot = await getDocs(q);
        const allComments:any = []; // 모든 댓글을 저장할 배열
    
        querySnapshot.forEach(doc => {
          const boardData = doc.data();
          if (boardData.comments && boardData.comments.length > 0) {
            // console.log(`Board ID: ${doc.id}, Comments:`, boardData.comments);
            allComments.push(...boardData.comments); // 댓글을 배열에 추가
          }
          // console.log(boardData.comments);
          
        });
    
        // 댓글이 있는 경우에만 상태 업데이트
        if (allComments.length > 0) {
          setComments(allComments);
        } else {
          setComments([]); // 댓글이 없을 경우 빈 배열로 설정
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    
    fetchCommentsFromAllBoards();
    
  }, [index]); // index가 변경될 때마다 호출
  
  const handleModify = () => {
    if (board) {
      // router.push(`/modify?index=${board.index}`);
      if (user && user?.uid=== boards?.userId) { // Check if the logged-in user's uid matches
        router.push(`/modify?index=${board.index}`);
    } else {
        alert('수정할 권한이 없습니다.'); // Alert for no permission
    }
    }
  };

  const handleDelete = async () => {
      if (board) {
          if (user && user?.uid === boards?.userId) { 
            const confirmDelete = window.confirm('정말로 삭제하시겠습니까?');
            if (confirmDelete) {
              const q = query(collection(db, 'boards'), where('index', '==', Number(board.index)));
              const querySnapshot = await getDocs(q);
              try {
                  if (!querySnapshot.empty) {
                      const boardDoc = querySnapshot.docs[0].ref;
                      await deleteDoc(boardDoc);
                      router.push('/');
                  } else {
                      console.error('게시글을 찾을 수 없습니다.');
                  }
              } catch (error) {
                  console.error('게시글 삭제 중 오류 발생:', error);
              }
            } else {
                alert('삭제가 취소되었습니다.'); // Alert for no permission
            }
          } else {
            alert('삭제할 권한이 없습니다.'); // Alert for no permission
        }
      }
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentContent.trim()) {
        alert('댓글 내용을 입력해 주세요.');
        return;
    }

    const newComment: Comment = {
        userid: nickname,
        commentUid: user?.uid,
        content: commentContent,
        date: new Date().toISOString(), // ISO 문자열로 저장
        replies: [],
        id: Date.now(), // 고유 ID 생성
    };

    // 'boards' 컬렉션에서 해당 게시글을 가져오기
    const q = query(collection(db, 'boards'), where('index', '==', Number(index)));
    const querySnapshot = await getDocs(q);

    try {
        if (!querySnapshot.empty) {
            // 게시글 문서 참조 가져오기
            const boardDoc = querySnapshot.docs[0].ref; // 첫 번째 문서 참조
            const boardData = querySnapshot.docs[0].data();

            // 기존 댓글 가져오기
            const existingComments = boardData.comments || [];
            const updatedComments = [...existingComments, newComment];

            // Firestore에 게시글 업데이트
            await updateDoc(boardDoc, { comments: updatedComments });
            setComments(updatedComments); // 상태 갱신
            setCommentContent(''); // 입력창 초기화
        } else {
            console.error('게시글을 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('댓글 저장 중 오류 발생:', error);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (replyContent && replyToId !== null) {
        const parentComment = findCommentById(comments, replyToId);
        const replyComment: Comment = {
            userid: nickname,
            commentUid: user?.uid,
            // content: `${parentComment?.userid} ${replyContent}`,
            content: replyContent,
            date: new Date().toISOString(),
            replies: [],
            id: Date.now(),
            replyToId,
            parentCommentId:parentComment?.userid
        };

        // 'boards' 컬렉션에서 해당 게시글을 가져오기
        const q = query(collection(db, 'boards'), where('index', '==', Number(index)));
        const querySnapshot = await getDocs(q);

        try {
            if (!querySnapshot.empty) {
                const boardDoc = querySnapshot.docs[0].ref;
                const boardData = querySnapshot.docs[0].data();

                // 기존 댓글 가져오기
                const existingComments = boardData.comments || [];
                const newComments = addReplyToComment(existingComments, replyComment, replyToId);

                // Firestore에 게시글 업데이트
                await updateDoc(boardDoc, { comments: newComments });
                setComments(newComments); // 상태 갱신
                setReplyContent(''); // 입력창 초기화
                setReplyToId(null); // 답글쓰기 창 닫기
            }
        } catch (error) {
            console.error('답글 저장 중 오류 발생:', error);
        }
    }
};

  const handleReplyToReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (replyContent && replyToReplyId !== null) {
        const parentComment = findCommentById(comments, replyToReplyId);
        const replyComment: Comment = {
            userid: nickname,
            commentUid: user?.uid,
            // content: `${parentComment?.userid} ${replyContent}`,
            content: replyContent,
            date: new Date().toISOString(),
            replies: [],
            id: Date.now(),
            replyToId: replyToReplyId,
            parentCommentId:parentComment?.userid
        };

        // 'boards' 컬렉션에서 해당 게시글을 가져오기
        const q = query(collection(db, 'boards'), where('index', '==', Number(index)));
        const querySnapshot = await getDocs(q);

        try {
            if (!querySnapshot.empty) {
                const boardDoc = querySnapshot.docs[0].ref;
                const boardData = querySnapshot.docs[0].data();

                // 기존 댓글 가져오기
                const existingComments = boardData.comments || [];
                const newComments = addReplyToComment(existingComments, replyComment, replyToReplyId);

                // Firestore에 게시글 업데이트
                await updateDoc(boardDoc, { comments: newComments });
                setComments(newComments); // 상태 갱신
                setReplyContent(''); // 입력창 초기화
                setReplyToReplyId(null); // 답글쓰기 창 닫기
            }
        } catch (error) {
            console.error('답글 저장 중 오류 발생:', error);
        }
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

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editCommentId !== null) {
        const updatedComments = updateCommentContent(comments, editCommentId, editCommentContent);

        // 'boards' 컬렉션에서 해당 게시글을 가져오기
        const q = query(collection(db, 'boards'), where('index', '==', Number(index)));
        const querySnapshot = await getDocs(q);
  
        try {
            if (!querySnapshot.empty) {
                const boardDoc = querySnapshot.docs[0].ref;
                console.log(querySnapshot.docs[0].ref);
                
                // Firestore에 게시글 업데이트
                await updateDoc(boardDoc, { comments: updatedComments });
                setComments(updatedComments); // 상태 갱신
                setEditCommentId(null); // 편집 모드 종료
                setEditCommentContent(''); // 입력창 초기화
            }
        } catch (error) {
            console.error('댓글 수정 중 오류 발생:', error);
        }
    }
};

  const handleEditReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (editReplyId !== null) {
          const updatedComments = updateReplyContent(comments, editReplyId, editReplyContent);

          // 'boards' 컬렉션에서 해당 게시글을 가져오기
          const q = query(collection(db, 'boards'), where('index', '==', Number(index)));
          const querySnapshot = await getDocs(q);
          console.log(querySnapshot);
          
          try {
              if (!querySnapshot.empty) {
                  const boardDoc = querySnapshot.docs[0].ref;

                  // Firestore에 게시글 업데이트
                  await updateDoc(boardDoc, { comments: updatedComments });
                  setComments(updatedComments); // 상태 갱신
                  setEditReplyId(null); // 편집 모드 종료
                  setEditReplyContent(''); // 입력창 초기화
              }
          } catch (error) {
              console.error('답글 수정 중 오류 발생:', error);
          }
      }
  };

  const handleDeleteComment = async (commentId: number) => {
    const isConfirmed = window.confirm("정말 이 답글을 삭제하시겠습니까?");
    
    if (!isConfirmed) {
        return; 
    }
    const updatedComments = deleteCommentById(comments, commentId);

    // 'boards' 컬렉션에서 해당 게시글을 가져오기
    const q = query(collection(db, 'boards'), where('index', '==', Number(index)));
    const querySnapshot = await getDocs(q);

    try {
        if (!querySnapshot.empty) {
            const boardDoc = querySnapshot.docs[0].ref;

            // Firestore에 게시글 업데이트
            await updateDoc(boardDoc, { comments: updatedComments });
            setComments(updatedComments); // 상태 갱신
        }
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
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

  const renderAttachments = (attachments: string[]) => {
    return attachments.map((attachment, index) => {
      const isImage = attachment.match(/\.(jpeg|jpg|gif|png)$/i) || attachment.startsWith('data:image');
      const isVideo = attachment.match(/\.(mp4|webm|ogg)$/i) || attachment.startsWith('data:video');
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
              <div>{reply.parentCommentId}</div>
              <div>{reply.content}</div>
              <div>{formatDate(reply.date)}</div>
              {/* <button onClick={() => handleEditReply(reply.id, reply.content)}>수정</button>
              <button onClick={() => handleDeleteComment(reply.id)}>삭제</button> */}
              {auth.currentUser?.uid === reply.commentUid && (
              <>
                <button onClick={() => handleEditReply(reply.id, reply.content)}>수정</button>
                <button onClick={() => handleDeleteComment(reply.id)}>삭제</button>
              </>
            )}
              <button onClick={() => setReplyToReplyId(replyToReplyId === reply.id ? null : reply.id)}>
                1답글쓰기
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

  return (
    <div>
      <h2>작성한 게시글</h2>
      <div>
        <div>
          <strong>제목: </strong> {board.subject}
        </div>
        <div>
          <strong>조회수: </strong> {board.views}
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
      {auth.currentUser?.uid === boards?.userId && (
        <>
        <button type="button" onClick={handleModify}>수정</button>
        <button type="button" onClick={handleDelete}>삭제</button>
        </>
      )}
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
                  {/* <button onClick={() => handleEditComment(comment.id, comment.content)}>수정</button>
                  <button onClick={() => handleDeleteComment(comment.id)}>삭제</button> */}
                  {auth.currentUser?.uid === comment.commentUid && (
                    <>
                      <button onClick={() => handleEditComment(comment.id, comment.content)}>수정</button>
                      <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                    </>
                  )}
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
