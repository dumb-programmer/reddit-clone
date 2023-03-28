import { useNavigate } from "react-router-dom";
import ContentLoader from "react-content-loader";
import JoinCommunityButton from "./JoinCommunityButton";
import CommunityIcon from "../icons/CommunityIcon";
import useRedirect from "../../hooks/useRedirect";
import useAuthContext from "../../hooks/useAuthContext";
import CommunityDescription from "./CommunityDescription";

const CommunityInfo = ({
  data,
  showJoined = false,
  showCreatePost = false,
  showAvatar = false,
}) => {
  const navigate = useNavigate();
  const redirectToLogin = useRedirect("/login", "You need to login first");
  const auth = useAuthContext();

  return (
    <aside className="community-sidebar">
      <div className="community-sidebar-header">
        <b>About Community</b>
      </div>
      <div className="community-sidebar-body">
        {showAvatar && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CommunityIcon style={{ height: 50, width: 50, fill: "#0079d3" }} />
            <p style={{ fontSize: 20 }}>r/{data?.name}</p>
          </div>
        )}
        {data ? (
          <CommunityDescription community={data} />
        ) : (
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
            onClick={
              auth ? () => navigate(`/r/${data?.name}/submit`) : redirectToLogin
            }
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
