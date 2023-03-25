import { useEffect, useState } from "react";
import { getProfileByUserId } from "../firebase";
import getRelativeDateTime from "../utils/getRelativeDateTime";

const SearchComment = ({ comment }) => {
  const { author, createdOn, editedOn, votes } = comment;
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfileByUserId(comment?.authorId).then((snap) =>
      setProfile(snap?.data().profilePicture)
    );
  }, [comment?.authorId]);

  return (
    <div className="comment" style={{ backgroundColor: "#fff", padding: 10 }}>
      <div className="comment-sidebar">
        <img src={profile} alt="avatar" className="avatar" />
      </div>
      <div className="comment-main">
        <div className="comment-body">
          <a
            href={`/user/${author}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {author}
          </a>
          <span
            style={{
              color: "#a4a7a8",
              marginLeft: 10,
            }}
          >
            {createdOn > 0
              ? getRelativeDateTime(createdOn.toMillis())
              : "Just Now"}
          </span>
          {editedOn && (
            <>
              <span
                style={{
                  color: "#a4a7a8",
                  marginLeft: 10,
                }}
              >
                .{" "}
              </span>

              <span
                style={{
                  color: "#a4a7a8",
                  marginLeft: 10,
                }}
              >
                edited{" "}
                {editedOn > 0
                  ? getRelativeDateTime(editedOn.toMillis())
                  : "Just Now"}
              </span>
            </>
          )}
          <p>{comment.comment}</p>
        </div>
        <div className="comment-footer">
          <p className="small-text">{votes} upvotes</p>
        </div>
      </div>
    </div>
  );
};

export default SearchComment;
