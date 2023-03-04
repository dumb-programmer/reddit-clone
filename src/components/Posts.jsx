import Post from "./Post";
import PostSkeleton from "./PostSkeleton";

const Posts = ({ data }) => {
  return (
    <div style={{ flex: 2, maxWidth: 832 }}>
      {data
        ? data.map((post) => (
            <Post key={post.id} data={post.data()} id={post.id} />
          ))
        : Array.from({ length: 5 }).map((_, idx) => <PostSkeleton key={idx} />)}
    </div>
  );
};

export default Posts;
