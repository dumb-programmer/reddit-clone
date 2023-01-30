import { useState } from "react";
import { createComment, editComment } from "../firebase";
import LoadingSVG from "./LoadingSVG";

const CommentBox = ({ postId, commentSnap, type, onCancel = null }) => {
  const [comment, setComment] = useState(
    (commentSnap && commentSnap.data().comment) || ""
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment) {
      setLoading(true);
      if (type === "edit") {
        editComment(commentSnap.ref, comment);
        onCancel();
      } else {
        await createComment(comment, localStorage.getItem("username"), postId);
      }
      setComment("");
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: 10 }}>
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
            gap: "1rem",
            marginTop: 10,
          }}
        >
          {onCancel && (
            <button className="secondary-btn comment-btn" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            className="primary-btn comment-btn"
            disabled={comment.length === 0}
          >
            {!loading ? (
              !type ? (
                "Comment"
              ) : (
                "Save Edits"
              )
            ) : (
              <LoadingSVG height={35} width={35} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentBox;
