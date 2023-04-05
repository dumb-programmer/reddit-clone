import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { subscribeToPost } from "../../firebase";
import getRelativeDateTime from "../../utils/getRelativeDateTime";
import MediaCarousal from "./MediaCarousal";
import Vote from "../Vote";

const Post = ({ data, id }) => {
  const [post, setPost] = useState(data);
  const [media, setMedia] = useState(null);
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

  useEffect(() => {
    let ignore = false;
    if (!ignore && post?.media) {
      setMedia((prev) => {
        if (prev && prev.length === post?.media.length) {
          const isEqual = prev.map(
            (item, index) => item === post?.media[index]
          );
          if (!isEqual.every((item) => item)) {
            return post?.media;
          } else {
            return prev;
          }
        } else {
          return post?.media;
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, [post?.media]);

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
            <Link
              to={`/r/${post.communityName}`}
              style={{ color: "#1c1c1c", textDecoration: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
              r/{post.communityName}
            </Link>
            <span>
              {" "}
              Posted by{" "}
              <Link
                to={`/user/${post.author}`}
                style={{ color: "inherit", textDecoration: "none" }}
                onClick={(e) => e.stopPropagation()}
              >
                u/{post.author}
              </Link>{" "}
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
          {media && media?.length !== 0 && <MediaCarousal paths={media} />}
        </div>
      </div>
    </div>
  );
};

export default Post;
