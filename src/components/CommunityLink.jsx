import useRedirect from "../hooks/useRedirect";
import CommunityIcon from "./icons/CommunityIcon";
import JoinCommunityButton from "./JoinCommunityButton";

const CommunityLink = ({ community }) => {
  const { name, description, icon, members, type } = community;
  const navigateToCommunity = useRedirect(`/r/${name}`);
  return (
    <div
      key={name}
      style={{
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0 10px",
        maxWidth: 800,
        marginBottom: 15,
        cursor: "pointer",
      }}
      onClick={() => navigateToCommunity()}
    >
      {(icon && <img src={icon} alt={`${name} icon`} className="avatar" />) || (
        <CommunityIcon
          style={{
            height: 50,
            width: 50,
            fill: "#0079d3",
            backgroundColor: "#fff",
            borderRadius: "50%",
            padding: 5,
          }}
        />
      )}
      <div style={{ flex: "2" }}>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            padding: 0,
          }}
        >
          <p>r/{name}</p>
          <p className="small-text">
            {" "}
            {new Intl.NumberFormat("en-US", {
              notation: "compact",
            }).format(members)}{" "}
            Members
          </p>
        </div>
        <p className="small-text" style={{ marginTop: -10 }}>
          {description}
        </p>
      </div>
      <JoinCommunityButton
        communityName={name}
        communityType={type}
        style={{ width: 80 }}
      />
    </div>
  );
};

export default CommunityLink;
