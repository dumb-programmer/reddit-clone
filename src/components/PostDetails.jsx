import { useEffect, useState } from "react";
import Vote from "./Vote";
import { useParams } from "react-router-dom";
import { getPostById } from "../firebase";
import getRelativeDateTime from "../utils/getRelativeDateTime";
import Comment from "./Comment";
import "../styles/PostDetails.css";
import CommentBox from "./CommentBox";

const PostDetails = () => {
  const [data, setData] = useState(null);
  const { postId } = useParams();

  useEffect(() => {
    let ignore = false;
    getPostById(postId).then((snap) => {
      if (!ignore) {
        console.log(snap.data());
        setData(snap.data());
      }
    });

    return () => {
      ignore = true;
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
            <Vote data={data} />
          </div>
          <div className="post-container">
            <div className="post-header">
              <p>
                Posted by u/{data?.author}{" "}
                {data && getRelativeDateTime(data?.createdOn.toMillis())}
              </p>
            </div>
            <h1>{data?.title}</h1>
            <p>{data?.content}</p>
            <CommentBox />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Comment />
          <Comment />
          <Comment />
          <Comment />
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
