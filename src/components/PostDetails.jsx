import { useEffect, useState } from "react";
import Vote from "./Vote";
import { useParams } from "react-router-dom";
import {
  getCommentsForPost,
  getPostById,
  subscribeToComments,
  subscribeToPost,
} from "../firebase";
import getRelativeDateTime from "../utils/getRelativeDateTime";
import Comment from "./Comment";
import CommentBox from "./CommentBox";
import "../styles/PostDetails.css";

const PostDetails = () => {
  const [data, setData] = useState(null);
  const [comments, setComments] = useState(null);
  const { postId } = useParams();

  useEffect(() => {
    let ignore = false;
    let docId;
    let unsubPost;
    getPostById(postId).then((snap) => {
      if (!ignore) {
        docId = snap.id;
        unsubPost = subscribeToPost(docId, (doc) => setData(doc.data()));
        setData(snap.data());
      }
    });

    getCommentsForPost(postId).then((data) => {
      if (!ignore) {
        setComments(data);
      }
    });

    const unsubComments = subscribeToComments(postId, (doc) => {
      const items = [];
      doc.forEach((snap) => items.push(snap.data()));
      setComments(items);
    });

    return () => {
      ignore = true;
      unsubComments();
      if (unsubPost) {
        unsubPost();
      }
    };
  }, [postId]);

  return (
    <div className="content-container">
      <div className="content">
        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <div className="post-sidebar">
            {data && <Vote data={data} type="post" />}
          </div>
          <div className="post-container">
            <div className="post-header">
              <p>
                Posted by u/{data?.author}{" "}
                {data && getRelativeDateTime(data.createdOn?.toMillis())}
              </p>
            </div>
            <h1>{data?.title}</h1>
            <p>{data?.content}</p>
            <CommentBox postId={postId} setComments={setComments} />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          {comments &&
            comments.map((comment) => (
              <Comment key={comment.id} data={comment} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
