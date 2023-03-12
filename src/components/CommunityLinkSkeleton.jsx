import ContentLoader from "react-content-loader";

const CommunityLinkSkeleton = () => {
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
        height={100}
        viewBox="0 0 800 100"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <rect x="279" y="87" rx="0" ry="0" width="2" height="0" />
        <circle cx="31" cy="42" r="26" />
        <rect x="70" y="16" rx="5" ry="5" width="144" height="21" />
        <rect x="68" y="47" rx="5" ry="5" width="600" height="35" />
        <rect x="680" y="30" rx="15" ry="15" width="100" height="30" />
      </ContentLoader>
    </div>
  );
};

export default CommunityLinkSkeleton;
