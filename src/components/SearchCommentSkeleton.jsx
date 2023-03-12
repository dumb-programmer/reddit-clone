import ContentLoader from "react-content-loader";

const SearchCommentSkeleton = () => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0 10px",
        maxWidth: 800,
        marginBottom: 15,
      }}
    >
      <ContentLoader
        speed={2}
        width={800}
        height={200}
        viewBox="0 0 800 200"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <circle cx="28" cy="34" r="23" />
        <rect x="70" y="16" rx="5" ry="5" width="150" height="14" />
        <rect x="240" y="15" rx="5" ry="5" width="96" height="14" />
        <rect x="70" y="46" rx="5" ry="5" width="700" height="105" />
      </ContentLoader>
    </div>
  );
};

export default SearchCommentSkeleton;
