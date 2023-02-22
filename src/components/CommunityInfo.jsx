import { useNavigate } from "react-router-dom";
import ContentLoader from "react-content-loader";
import JoinCommunityButton from "./JoinCommunityButton";

const CommunityInfo = ({ data, showJoined, showCreatePost }) => {
  const navigate = useNavigate();
  return (
    <aside className="community-sidebar">
      <div className="community-sidebar__header">
        <b>About Community</b>
      </div>
      <div className="community-description">
        <p style={{ fontSize: 16, wordWrap: "break-word" }}>
          {data?.description || (
            <ContentLoader
              speed={2}
              width={300}
              height={76}
              viewBox="0 0 421 76"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <rect x="2" y="0" rx="0" ry="0" width="300" height="10" />
              <rect x="2" y="18" rx="0" ry="0" width="290" height="10" />
              <rect x="2" y="40" rx="0" ry="0" width="310" height="10" />
              <rect x="2" y="58" rx="0" ry="0" width="279" height="10" />
            </ContentLoader>
          )}
        </p>
        {data && (
          <span style={{ color: "#818589" }}>
            Created{" "}
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
            }).format(new Date(data?.createdOn.toMillis()))}
          </span>
        )}
        {data && (
          <p>
            {new Intl.NumberFormat("en-US", { notation: "compact" }).format(
              data?.members
            )}{" "}
            Members
          </p>
        )}
        {data && showCreatePost && (
          <button
            className="primary-btn"
            style={{ width: "100%", marginLeft: -5 }}
            onClick={() => navigate(`/r/${data?.name}/submit`)}
          >
            Create Post
          </button>
        )}
        {data && showJoined && (
          <JoinCommunityButton
            communityName={data?.name}
            communityType={data?.type}
          />
        )}
      </div>
    </aside>
  );
};

export default CommunityInfo;
