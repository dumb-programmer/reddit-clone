const BackToTopButton = ({ visible }) => {
  return (
    <button
      className="primary-btn"
      style={{
        display: visible ? "block" : "none",
        position: "fixed",
        bottom: 15,
        right: 150,
        minWidth: 100,
        padding: 10,
        fontWeight: "bold",
        fontSize: 16,
        borderRadius: 25,
      }}
      onClick={() => {
        console.log("Hello");
        window.scroll(0, 0);
      }}
    >
      Back to Top
    </button>
  );
};

export default BackToTopButton;
