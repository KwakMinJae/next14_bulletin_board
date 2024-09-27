import { Post } from '@/types/types';
import { useSession } from 'next-auth/react'; 

interface PostActionsProps {
    post: Post;
}

const PostActions: React.FC<PostActionsProps> = ({ post }) => {
  const { data: session } = useSession();

  const handleDelete = async () => {
    if (session?.user.name === post.writer) {
      await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });
    } else {
      alert('권한이 없습니다.');
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>삭제</button>
      {/* 수정 버튼 등 추가 */}
    </div>
  );
};

export default PostActions;
