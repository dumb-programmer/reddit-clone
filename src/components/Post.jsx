import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToPost } from "../firebase";
import getRelativeDateTime from "../utils/getRelativeDateTime";
import MediaCarousal from "./MediaCarousal";
import Vote from "./Vote";

const Post = ({ data, id }) => {
  const [post, setPost] = useState(data);
  const navigate = useNavigate();

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

  return (
    <div
      className="post"
      onClick={() => navigate(`/r/${post.communityName}/${post.id}`)}
    >
      <div className="post-sidebar" onClick={(e) => e.stopPropagation()}>
        {post && <Vote data={post} type="post" />}
      </div>
      <div className="post-main">
        <div className="post-header">
          <p>
            <a
              href={`/r/${post.communityName}`}
              style={{ color: "#1c1c1c", textDecoration: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
              r/{post.communityName}
            </a>
            <span>
              {" "}
              Posted by{" "}
              <a
                href={`/user/${post.author}`}
                style={{ color: "inherit", textDecoration: "none" }}
                onClick={(e) => e.stopPropagation()}
              >
                u/{post.author}
              </a>{" "}
              {getRelativeDateTime(post?.createdOn.toMillis())}{" "}
            </span>
          </p>
        </div>
        <div className="post-title">
          <h3>{post.title}</h3>
        </div>
        <div className="post-body">
          {post.content}
          {post.link && (
            <a className="link" href={post.link}>
              {post.link}
            </a>
          )}
          {post?.media?.length > 0 && <MediaCarousal paths={post.media} />}
        </div>
      </div>
    </div>
  );
};

export default Post;
