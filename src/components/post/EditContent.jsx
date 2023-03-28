import { useState } from "react";
import { editPostContent, editPostLink } from "../../firebase";
import LoadingSVG from "../LoadingSVG";

const EditContent = ({ contentRef, onCancel }) => {
  const [text, setText] = useState(
    contentRef.data().content || contentRef.data().link
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text) {
      setLoading(true);
      if (contentRef.data().content) {
        await editPostContent(contentRef.ref, text);
      } else {
        await editPostLink(contentRef.ref, text);
      }
      onCancel();
    }
  };

  return (
    <div style={{ paddingBottom: 10 }}>
      <form onSubmit={handleSubmit}>
        <textarea
          data-testid="edit-post-textbox"
          className="comment-box"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            marginTop: 10,
          }}
        >
          <button
            data-testid="cancel-edit-btn"
            className="secondary-btn comment-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            data-testid="save-edits-btn"
            className="primary-btn comment-btn"
            disabled={text.length === 0 || loading}
          >
            {!loading ? "Save Edits" : <LoadingSVG height={35} width={35} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditContent;
