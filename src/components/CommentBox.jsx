import { useState } from "react";
import LoadingSVG from "./LoadingSVG";

const CommentBox = () => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment) {
      setLoading(true);
    }
  };

  return (
    <div style={{ paddingBottom: 10 }}>
      <p style={{ fontSize: 12 }}>
        Comment as {localStorage.getItem("username")}
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          className="comment-box"
          placeholder="What are your thoughts?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 10,
          }}
        >
          <button
            className="primary-btn comment-btn"
            disabled={comment.length === 0}
          >
            {!loading ? "Comment" : <LoadingSVG height={35} width={35} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentBox;
