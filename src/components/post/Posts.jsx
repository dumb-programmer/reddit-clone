import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import PostSkeleton from "./PostSkeleton";

const Posts = ({ data, setData, fetchPosts }) => {
  const observable = useRef();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const { isIntersecting } = entries[0];
      if (isIntersecting) {
        if (hasMore && data !== null) {
          const cursorDoc = data[data.length - 1];
          setLoading(true);
          fetchPosts(cursorDoc).then((posts) => {
            if (posts.length === 0) {
              setHasMore(false);
            } else {
              setData((data) => [...data, ...posts]);
            }
            setLoading(false);
          });
        }
      }
    });

    if (observable.current) {
      observer.observe(observable.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [data, setData, fetchPosts, hasMore]);

  return (
    <div style={{ flex: 2, maxWidth: 832 }}>
      <div>
        {data
          ? data.map((post) => (
              <Post key={post.id} data={post.data()} id={post.id} />
            ))
          : Array.from({ length: 5 }).map((_, idx) => (
              <PostSkeleton key={idx} />
            ))}
        {loading && <PostSkeleton />}
      </div>
      {!loading && (
        <div ref={observable}>
          {!hasMore && <p style={{ textAlign: "center" }}>No more posts</p>}
        </div>
      )}
    </div>
  );
};

export default Posts;
