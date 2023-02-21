import { useNavigate } from "react-router-dom";

const CommunityInfo = ({ data }) => {
  const navigate = useNavigate();
  return (
    <aside className="community-sidebar">
      <div className="community-sidebar__header">
        <b>About Community</b>
      </div>
      <div className="community-description">
        <p style={{ fontSize: 16, wordWrap: "break-word" }}>
          {data?.description}
        </p>
        <span style={{ color: "#818589" }}>
          Created{" "}
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
          }).format(new Date(data?.createdOn.toMillis()))}
        </span>
        <p>
          {new Intl.NumberFormat("en-US", { notation: "compact" }).format(
            data?.members
          )}{" "}
          Members
        </p>
        <button
          className="primary-btn"
          style={{ width: "100%", marginLeft: -5 }}
          onClick={() => navigate(`/r/${data?.communityName}/submit`)}
        >
          Create Post
        </button>
      </div>
    </aside>
  );
};

export default CommunityInfo;
