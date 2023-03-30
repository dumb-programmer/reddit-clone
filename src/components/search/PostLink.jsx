import useRedirect from "../../hooks/useRedirect";
import getRelativeDateTime from "../../utils/getRelativeDateTime";

const PostLink = ({ post }) => {
  const { id, communityName, author, title, votes, createdOn } = post;
  const navigateToPost = useRedirect(`/r/${communityName}/${id}`);

  return (
    <div className="post" onClick={() => navigateToPost()}>
      <div className="post-main">
        <div className="post-header">
          <p>
            <a
              href={`/r/${communityName}`}
              style={{ color: "#1c1c1c", textDecoration: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
              r/{communityName}
            </a>{" "}
            <span>
              Posted by{" "}
              <a
                href={`/user/${author}`}
                style={{ color: "inherit", textDecoration: "none" }}
                onClick={(e) => e.stopPropagation()}
              >
                u/{post.author}
              </a>{" "}
              {getRelativeDateTime(createdOn.toMillis())}{" "}
            </span>
          </p>
        </div>
        <div className="post-title">
          <h3>{title}</h3>
        </div>
        <div className="post-footer" style={{ display: "flex", gap: "1rem" }}>
          <p className="small-text">{votes} upvotes</p>
        </div>
      </div>
    </div>
  );
};

export default PostLink;
