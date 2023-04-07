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
            width={800}
            height={200}
            viewBox="0 0 800 200"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="279" y="87" rx="0" ry="0" width="2" height="0" />
            <rect x="104" y="31" rx="0" ry="0" width="0" height="1" />
            <circle cx="145" cy="83" r="3" />
            <rect x="3" y="103" rx="0" ry="0" width="106" height="23" />
            <rect x="-2" y="68" rx="0" ry="0" width="255" height="23" />
            <rect x="3" y="145" rx="0" ry="0" width="285" height="27" />
            <rect x="0" y="1" rx="0" ry="0" width="234" height="23" />
            <rect x="-2" y="34" rx="0" ry="0" width="286" height="23" />
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
