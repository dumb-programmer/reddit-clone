const BackToTopButton = ({ visible }) => {
  return (
    <button
      className="primary-btn back-to-top-btn"
      style={{
        display: visible ? "block" : "none",
      }}
      onClick={() => {
        window.scroll(0, 0);
      }}
    >
      Back to Top
    </button>
  );
};

export default BackToTopButton;
