const NoResultsFound = ({ query }) => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 50,
        borderRadius: 5,
      }}
    >
      <img
        src="https://www.redditstatic.com/desktop2x/img/telescope-snoo.png"
        alt="No results"
        style={{ height: 126, width: 134 }}
      />
      <h1>Hmm... we couldn't find any results for "{query}"</h1>
      <p className="small-text">
        Double-checking your spelling or try different keywords
      </p>
    </div>
  );
};

export default NoResultsFound;
