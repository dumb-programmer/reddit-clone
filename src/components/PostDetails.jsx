import { useEffect, useState } from "react";
import Vote from "./Vote";
import { useParams } from "react-router-dom";
import {
  getCommentsForPost,
  getPostById,
  subscribeToComments,
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
    getPostById(postId).then((snap) => {
      if (!ignore) {
        setData(snap.data());
      }
    });

    getCommentsForPost(postId).then((data) => setComments(data));

    const unsub = subscribeToComments(postId, (doc) => {
      const items = [];
      doc.forEach((snap) => items.push(snap.data()));
      setComments(items);
    });

    return () => {
      ignore = true;
      unsub();
    };
  }, [postId]);

  console.log(comments);

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
            <Vote data={data} />
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
          {comments && comments.map((comment) => <Comment data={comment} />)}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
