import ContentLoader from "react-content-loader";

const PostSkeleton = (props) => (
  <div className="post">
    <div className="post-sidebar">
      <>
        <button className="upvote-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-arrow-up"
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
        <p></p>
        <button className="downvote-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-arrow-down"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      </>
    </div>
    <div className="post-main">
      <ContentLoader
        speed={2}
        width="100%"
        height={400}
        viewBox="0 0 800 400"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        {...props}
      >
        <rect x="8" y="19" rx="4" ry="4" width="315" height="11" />
        <rect x="279" y="87" rx="0" ry="0" width="2" height="0" />
        <rect x="6" y="50" rx="5" ry="5" width="351" height="22" />
        <rect x="7" y="84" rx="0" ry="0" width="760" height="306" />
      </ContentLoader>
    </div>
  </div>
);

export default PostSkeleton;
