import { useState } from "react";
import useAuthContext from "../../hooks/useAuthContext";
import useRedirect from "../../hooks/useRedirect";
import LoadingSVG from "../LoadingSVG";

const CommentBox = ({
  commentSnap,
  primaryCaption,
  onSubmit,
  onCancel = null,
}) => {
  const [comment, setComment] = useState(
    (commentSnap && commentSnap.data().comment) || ""
  );
  const [loading, setLoading] = useState(false);
  const redirectToLogin = useRedirect("/login", "You need to login first");
  const auth = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment) {
      setLoading(true);
      onSubmit(comment);
      onCancel && onCancel();
      setComment("");
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: 10 }}>
      <form
        onSubmit={
          auth
            ? handleSubmit
            : (e) => {
                e.preventDefault();
                redirectToLogin();
              }
        }
      >
        <textarea
          data-testid="comment-box"
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
            data-testid="comment-btn"
            className="primary-btn comment-btn"
            disabled={comment.length === 0}
          >
            {!loading ? primaryCaption : <LoadingSVG height={35} width={35} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentBox;
