import React, { useState } from "react";
import MessageIcon from "./MessageIcon";
import Vote from "./Vote";
import getRelativeDateTime from "../utils/getRelativeDateTime";
import ShowMore from "./ShowMore";
import CommentBox from "./CommentBox";
import "../styles/Comment.css";
import { deleteComment } from "../firebase";

const Comment = ({ comment, isSaved, setToastText, showToast }) => {
  const [edit, setEdit] = useState(false);

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
              type="edit"
              commentSnap={comment}
              onCancel={() => setEdit(false)}
            />
          )}
        </div>
      </div>
      {!edit && (
        <div className="comment-footer">
          <Vote data={data} type="comment" />
          <button className="reply-btn">
            <MessageIcon height={24} width={24} stroke="black" />
            <span>Reply</span>
          </button>
          <ShowMore
            id={data.id}
            onEdit={() => setEdit(true)}
            confirmationText="Are you sure you want to delete your comment?"
            confirmationHeader="Delete comment"
            handleDelete={async () => {
              await deleteComment(comment.ref);
            }}
            isSaved={isSaved}
            context="comment"
            showToast={showToast}
            setToastText={setToastText}
          />
        </div>
      )}
    </div>
  );
};

export default Comment;
