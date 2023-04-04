import { useEffect, useState } from "react";
import MessageIcon from "../icons/MessageIcon";
import Vote from "../Vote";
import getRelativeDateTime from "../../utils/getRelativeDateTime";
import ShowMore from "./ShowMore";
import CommentBox from "./CommentBox";
import {
  createComment,
  deleteComment,
  editComment,
  getComments,
  getProfileByUserId,
  subscribeToComments,
} from "../../firebase";
import MaximizeIcon from "../icons/MaximizeIcon";
import useAuthContext from "../../hooks/useAuthContext";
import { Link } from "react-router-dom";
import useRedirect from "../../hooks/useRedirect";
import "../../styles/Comment.css";

const Comment = ({ comment, saved, setToastText, showToast }) => {
  const [edit, setEdit] = useState(false);
  const [reply, setReply] = useState(false);
  const [replies, setReplies] = useState(null);
  const [minimize, setMinimize] = useState(false);
  const [profile, setProfile] = useState(null);
  const auth = useAuthContext();
  const redirectToLogin = useRedirect("/login", "You need to login first");

  const data = comment.data();

  useEffect(() => {
    let ignore = false;

    getProfileByUserId(data?.authorId).then((snap) =>
      setProfile(snap?.data().profilePicture)
    );

    const unsubComments = subscribeToComments(data?.id, (doc) => {
      if (!ignore && !doc.empty) {
        const items = [];
        doc.forEach((snap) => items.push(snap));
        setReplies(items);
      }
    });

    return () => {
      ignore = true;
      unsubComments();
    };
  }, [data.id, data.authorId]);

  if (minimize) {
    return (
      <div
        className="comment"
        style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}
      >
        <button
          data-testid="maximize-btn"
          style={{ background: "unset", border: "none" }}
          onClick={() => setMinimize(false)}
        >
          <MaximizeIcon height={20} width={20} fill="#ffff" stroke="#0079d3" />
        </button>
        <img src={profile} alt="avatar" className="avatar" />
        <div className="comment-header">
          <a
            href={`/user/${data.author}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {data.author}
          </a>
          <span
            style={{
              color: "#a4a7a8",
              marginLeft: 10,
            }}
          >
            {data.createdOn > 0
              ? getRelativeDateTime(data.createdOn.toMillis())
              : "Just Now"}
          </span>
          {data.editedOn && (
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
                {data.editedOn > 0
                  ? getRelativeDateTime(data.editedOn.toMillis())
                  : "Just Now"}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="comment">
      <div className="comment-sidebar">
        <img src={profile} alt="avatar" className="avatar" />
        <div
          data-testid="thread-line"
          className="thread-line"
          onClick={() => setMinimize(true)}
        ></div>
      </div>
      <div className="comment-main">
        <div className="comment-body">
          <Link
            to={`/user/${data.author}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {data.author}
          </Link>
          <span
            style={{
              color: "#a4a7a8",
              marginLeft: 10,
            }}
          >
            {data.createdOn > 0
              ? getRelativeDateTime(data.createdOn.toMillis())
              : "Just Now"}
          </span>
          {data.editedOn && (
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
                {data.editedOn > 0
                  ? getRelativeDateTime(data.editedOn.toMillis())
                  : "Just Now"}
              </span>
            </>
          )}
          {!edit ? (
            <p>{data.comment}</p>
          ) : (
            <CommentBox
              primaryCaption="Save Edits"
              onSubmit={async (value) => {
                editComment(comment.ref, value);
              }}
              commentSnap={comment}
              onCancel={() => setEdit(false)}
            />
          )}
        </div>
        {!edit && (
          <div className="comment-footer">
            <Vote data={data} type="comment" />
            <button
              className="reply-btn"
              onClick={
                auth ? () => setReply((prev) => !prev) : () => redirectToLogin()
              }
            >
              <MessageIcon height={24} width={24} stroke="black" />
              <span>Reply</span>
            </button>
            <ShowMore
              id={data.id}
              confirmationText="Are you sure you want to delete your comment?"
              confirmationHeader="Delete comment"
              onEdit={() => setEdit(true)}
              isSaved={saved && saved.includes(data.id)}
              isOwner={auth?.uid === data?.authorId}
              handleDelete={async () => {
                await deleteComment(comment.ref);
              }}
              context="comment"
              showToast={showToast}
              setToastText={setToastText}
            />
          </div>
        )}
        <div className="replies">
          {reply && (
            <CommentBox
              primaryCaption="Reply"
              onSubmit={async (comment) => {
                await createComment(
                  comment,
                  localStorage.getItem("username"),
                  auth.uid,
                  data?.id
                );
              }}
              onCancel={() => setReply(false)}
            />
          )}
          {replies &&
            replies.map((replies) => (
              <Comment
                key={replies.data().id}
                comment={replies}
                saved={saved}
                showToast={showToast}
                setToastText={setToastText}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Comment;
