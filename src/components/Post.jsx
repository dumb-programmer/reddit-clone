import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToPost } from "../firebase";
import getRelativeDateTime from "../utils/getRelativeDateTime";
import Vote from "./Vote";

const Post = ({ data, id }) => {
  const [post, setPost] = useState(data);

  useEffect(() => {
    let ignore = false;
    const unsub = subscribeToPost(id, (doc) => {
      if (!ignore) {
        setPost(doc.data());
      }
    });

    return () => {
      unsub();
    };
  }, [id]);

  const navigate = useNavigate();
  return (
    <div className="post" onClick={() => navigate(`/post/${post.id}`)}>
      <div className="post-sidebar" onClick={(e) => e.stopPropagation()}>
        {post && <Vote data={post} type="post" />}
      </div>
      <div className="post-main">
        <div className="post-header">
          <p>
            <b>r/{post.communityName}</b>
            <span>
              {" "}
              Posted by u/{post.author}{" "}
              {getRelativeDateTime(data.createdOn.toMillis())}{" "}
            </span>
          </p>
        </div>
        <div className="post-title">
          <h3>{post.title}</h3>
        </div>
        <div className="post-body">{post.content}</div>
      </div>
    </div>
  );
};

export default Post;
