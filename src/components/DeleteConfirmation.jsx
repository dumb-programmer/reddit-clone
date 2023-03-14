import { useState } from "react";

const DeleteConfirmation = ({ header, text, setShowModal, handleDelete }) => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="modal-container">
      <div className="modal">
        <header className="modal-header">
          <h4>{header}</h4>
          <button
            className="close-modal-btn"
            onClick={() => setShowModal(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c7c7c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-x"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        <div className="modal-body">
          <p style={{ color: "#454545" }}>{text}</p>
        </div>
        <footer className="modal-footer">
          <button
            className="primary-btn danger-btn"
            onClick={
              !loading
                ? async () => {
                    setLoading(true);
                    await handleDelete();
                    setShowModal(false);
                  }
                : null
            }
            disabled={loading}
          >
            Delete
          </button>
          <button
            className="secondary-btn"
            onClick={!loading ? () => setShowModal(false) : null}
            disabled={loading}
          >
            Keep
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
