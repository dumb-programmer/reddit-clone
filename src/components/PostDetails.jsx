import { useContext, useEffect, useState } from "react";
import Vote from "./Vote";
import { useParams } from "react-router-dom";
import {
  createComment,
  deletePost,
  getComments,
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
import CommentSkeleton from "./CommentSkeleton";
import ContentLoader from "react-content-loader";

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
    // Subscribe to user document to listen for saved state changes
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

    getComments(postId).then((data) => {
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
              {data ? (
                <p>
                  Posted by u/{data?.author}{" "}
                  {data && getRelativeDateTime(data.createdOn?.toMillis())}
                </p>
              ) : (
                <ContentLoader
                  speed={2}
                  width={278}
                  height={38}
                  viewBox="0 0 278 38"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                >
                  <rect x="20" y="27" rx="0" ry="0" width="247" height="9" />
                </ContentLoader>
              )}
            </div>
            <h1>
              {data ? (
                data?.title
              ) : (
                <ContentLoader
                  speed={2}
                  width={387}
                  height={38}
                  viewBox="0 0 387 38"
                  backgroundColor="#f3f3f3"
                  foregroundColor="#ecebeb"
                >
                  <rect x="17" y="-1" rx="0" ry="0" width="321" height="32" />
                </ContentLoader>
              )}
            </h1>
            {!editPost ? (
              <p>
                {data ? (
                  data?.content
                ) : (
                  <ContentLoader
                    speed={2}
                    width={421}
                    height={76}
                    viewBox="0 0 421 76"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                  >
                    <rect x="19" y="0" rx="0" ry="0" width="401" height="8" />
                    <rect x="19" y="17" rx="0" ry="0" width="346" height="8" />
                    <rect x="20" y="35" rx="0" ry="0" width="374" height="8" />
                    <rect x="20" y="53" rx="0" ry="0" width="279" height="8" />
                  </ContentLoader>
                )}
              </p>
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
                    isOwner={localStorage.getItem("username") === data?.author}
                  />
                </div>
              </div>
            )}
            <p style={{ fontSize: 12 }}>
              Comment as {localStorage.getItem("username")}
            </p>
            <CommentBox
              primaryCaption="Comment"
              onSubmit={async (comment) => {
                await createComment(
                  comment,
                  localStorage.getItem("username"),
                  postId
                );
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          {comments &&
            comments.map((comment) => (
              <Comment
                key={comment.data().id}
                comment={comment}
                saved={saved}
                showToast={() => setShowToast(true)}
                setToastText={setToastText}
              />
            ))}
          {!comments &&
            Array.from({ length: 5 }).map((item, idx) => (
              <CommentSkeleton id={idx} />
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
