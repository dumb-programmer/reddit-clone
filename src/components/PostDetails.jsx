import { useContext, useEffect, useState } from "react";
import Vote from "./Vote";
import { useParams } from "react-router-dom";
import {
  deletePost,
  getCommentsForPost,
  getPostById,
  subscribeToComments,
  subscribeToPost,
  subscribeToUserDoc,
} from "../firebase";
import getRelativeDateTime from "../utils/getRelativeDateTime";
import Comment from "./Comment";
import CommentBox from "./CommentBox";
import "../styles/PostDetails.css";
import AuthContext from "../context/AuthContext";
import MessageIcon from "./MessageIcon";
import ShareArrowIcon from "./ShareArrowIcon";
import ShowMore from "./ShowMore";
import ToastNotification from "./ToastNotification";
import EditContent from "./EditContent";

const PostDetails = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(null);
  const [saved, setSaved] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");
  const [editPost, setEditPost] = useState(false);
  const auth = useContext(AuthContext);
  const { postId } = useParams();

  useEffect(() => {
    const unsubUser = subscribeToUserDoc(auth.uid, (doc) => {
      const user = doc.data();
      setSaved(user.saved);
    });

    let ignore = false;
    let docId;
    let unsubPost;
    getPostById(postId).then((snap) => {
      if (!ignore) {
        docId = snap.id;
        unsubPost = subscribeToPost(docId, (doc) => setPost(doc));
        setPost(snap);
      }
    });

    getCommentsForPost(postId).then((data) => {
      if (!ignore) {
        setComments(data);
      }
    });

    const unsubComments = subscribeToComments(postId, (doc) => {
      const items = [];
      doc.forEach((snap) => items.push(snap));
      setComments(items);
    });

    return () => {
      ignore = true;
      unsubComments();
      unsubUser();
      if (unsubPost) {
        unsubPost();
      }
    };
  }, [postId, auth]);

  const data = post?.data();

  return (
    <div className="content-container">
      <div className="content">
        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <div className="post-sidebar">
            {data && <Vote data={data} type="post" />}
          </div>
          <div className="post-container">
            <div className="post-header">
              <p>
                Posted by u/{data?.author}{" "}
                {data && getRelativeDateTime(data.createdOn?.toMillis())}
              </p>
            </div>
            <h1>{data?.title}</h1>
            {!editPost ? (
              <p>{data?.content}</p>
            ) : (
              <EditContent
                contentRef={post}
                onCancel={() => setEditPost(false)}
              />
            )}
            {data && (
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  padding: "10px 0",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "centers",
                    gap: "0.5rem",
                  }}
                >
                  <MessageIcon height={24} width={24} stroke={"black"} />
                  {comments && comments.length}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "centers",
                    gap: "0.5rem",
                  }}
                >
                  <ShareArrowIcon height={24} width={24} />
                </div>
                <div>
                  <ShowMore
                    id={data?.id}
                    isSaved={saved && saved.includes(data?.id)}
                    context="post"
                    confirmationText="Are you sure you want to delete your post? You can't undo this."
                    confirmationHeader="Delete post?"
                    handleDelete={async () => {
                      await deletePost(post.ref);
                    }}
                    onEdit={() => setEditPost(true)}
                    showToast={() => setShowToast(true)}
                    setToastText={setToastText}
                  />
                </div>
              </div>
            )}
            <p style={{ fontSize: 12 }}>
              Comment as {localStorage.getItem("username")}
            </p>
            <CommentBox postId={postId} />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          {comments &&
            comments.map((comment) => (
              <Comment
                key={comment.data().id}
                comment={comment}
                isSaved={saved && saved.includes(comment.data().id)}
                showToast={() => setShowToast(true)}
                setToastText={setToastText}
              />
            ))}
        </div>
      </div>
      {showToast && (
        <ToastNotification text={toastText} setDisplay={setShowToast} />
      )}
    </div>
  );
};

export default PostDetails;
