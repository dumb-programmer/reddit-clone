import ContentLoader from "react-content-loader";

const PostLinkSkeleton = () => {
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
        <rect x="279" y="87" rx="0" ry="0" width="2" height="0" />
        <rect x="104" y="31" rx="0" ry="0" width="0" height="1" />
        <rect x="11" y="10" rx="5" ry="5" width="132" height="23" />
        <rect x="166" y="10" rx="5" ry="5" width="233" height="23" />
        <rect x="12" y="45" rx="5" ry="5" width="560" height="112" />
        <rect x="590" y="47" rx="5" ry="5" width="180" height="112" />
        <rect x="14" y="170" rx="5" ry="5" width="215" height="20" />
      </ContentLoader>
    </div>
  );
};

export default PostLinkSkeleton;
