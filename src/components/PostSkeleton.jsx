import ContentLoader from "react-content-loader";

const PostSkeleton = (props) => (
  <ContentLoader
    speed={2}
    width={400}
    height={160}
    viewBox="0 0 400 160"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="20" y="27" rx="0" ry="0" width="255" height="27" />
    <rect x="23" y="75" rx="0" ry="0" width="324" height="5" />
    <rect x="25" y="89" rx="0" ry="0" width="271" height="5" />
    <rect x="24" y="102" rx="0" ry="0" width="312" height="5" />
    <rect x="23" y="116" rx="0" ry="0" width="219" height="5" />
  </ContentLoader>
);

export default PostSkeleton;
