import ContentLoader from "react-content-loader";

const CommentSkeleton = (props) => {
  return (
    <ContentLoader
      speed={2}
      width={400}
      height={160}
      viewBox="0 0 400 160"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      {...props}
    >
      <circle cx="16" cy="16" r="16" />
      <rect x="45" y="2" rx="0" ry="0" width="127" height="9" />
      <rect x="43" y="24" rx="0" ry="0" width="343" height="89" />
    </ContentLoader>
  );
};

export default CommentSkeleton;
