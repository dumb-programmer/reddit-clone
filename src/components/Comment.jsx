import React, { useState } from "react";
import MessageIcon from "./MessageIcon";
import Vote from "./Vote";
import getRelativeDateTime from "../utils/getRelativeDateTime";
import ShowMore from "./ShowMore";
import CommentBox from "./CommentBox";
import "../styles/Comment.css";
import { deleteComment, editComment } from "../firebase";

const Comment = ({ comment, isSaved, setToastText, showToast }) => {
  const [edit, setEdit] = useState(false);
  const [reply, setReply] = useState(false);

  const data = comment.data();

  return (
    <div className="comment-container">
      <div className="comment">
        <img
          src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png"
          alt="avatar"
          className="avatar"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingLeft: 10,
            flex: 2,
          }}
        >
          <div className="comment-header">
            <span>{data.author}</span>
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
          {!edit ? (
            <p>{data.comment}</p>
          ) : (
            <CommentBox
              primaryCaption="Save Edits"
              onSubmit={async (comment) => {
                editComment(comment.ref, comment);
              }}
              commentSnap={comment}
              onCancel={() => setEdit(false)}
            />
          )}
        </div>
      </div>
      {!edit && (
        <div className="comment-footer">
          <Vote data={data} type="comment" />
          <button
            className="reply-btn"
            onClick={() => setReply((prev) => !prev)}
          >
            <MessageIcon height={24} width={24} stroke="black" />
            <span>Reply</span>
          </button>
          <ShowMore
            id={data.id}
            confirmationText="Are you sure you want to delete your comment?"
            confirmationHeader="Delete comment"
            onEdit={() => setEdit(true)}
            isSaved={isSaved}
            isOwner={localStorage.getItem("username") === data?.author}
            handleDelete={async () => {
              await deleteComment(comment.ref);
            }}
            context="comment"
            showToast={showToast}
            setToastText={setToastText}
          />
        </div>
      )}
      <div style={{ marginLeft: 60, paddingRight: 10 }}>
        {reply && (
          <CommentBox primaryCaption="Reply" onCancel={() => setReply(false)} />
        )}
      </div>
    </div>
  );
};

export default Comment;
