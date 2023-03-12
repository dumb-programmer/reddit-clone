import useRedirect from "../hooks/useRedirect";

const ProfileLink = ({ user }) => {
  const { username, profilePicture, about } = user;
  const navigateToProfile = useRedirect(`/user/${username}`);
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
        cursor: "pointer",
      }}
      onClick={() => navigateToProfile()}
    >
      <img
        src={profilePicture}
        alt={`${username} profile`}
        className="avatar"
      />
      <div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            padding: 0,
          }}
        >
          <p>u/{username}</p>
        </div>
        <p className="small-text" style={{ marginTop: -10 }}>
          {about}
        </p>
      </div>
    </div>
  );
};

export default ProfileLink;
