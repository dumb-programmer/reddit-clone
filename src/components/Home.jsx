import { useEffect, useState } from "react";
import CreateCommunityModal from "./community/CreateCommunityModal";
import { getAllPosts, getUserHome } from "../firebase";
import Posts from "./post/Posts";
import { useLocation } from "react-router-dom";
import ToastNotification from "./ToastNotification";
import useAuthContext from "../hooks/useAuthContext";
import "../styles/Home.css";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const username = localStorage.getItem("username");
  const [data, setData] = useState(null);
  const auth = useAuthContext();
  const { state } = useLocation();
  const [displayToast, setDisplayToast] = useState(state?.message?.length > 0);

  useEffect(() => {
    let ignore = false;
    if (!auth) {
      getAllPosts().then((snapshot) => {
        if (!ignore) {
          setData(snapshot);
        }
      });
    } else {
      getUserHome(auth.uid).then((snapshot) => {
        console.log(snapshot);
        if (!ignore) {
          setData(snapshot);
        }
      });
    }

    return () => {
      ignore = true;
    };
  }, [auth]);

  return (
    <div className="container">
      {showModal && (
        <CreateCommunityModal
          username={username}
          onExit={() => setShowModal(false)}
        />
      )}
      <Posts
        data={data}
        setData={setData}
        fetchPosts={
          auth !== null
            ? (cursorDoc) => getUserHome(auth.uid, cursorDoc)
            : (cursorDoc) => getAllPosts(cursorDoc)
        }
      />
      {auth && (
        <aside data-testid="home-sidebar" className="main-btns">
          <img
            src="https://www.redditstatic.com/desktop2x/img/id-cards/home-banner@2x.png"
            alt="banner art"
          />
          <div style={{ display: "flex" }}>
            <img
              id="reddit-avatar"
              src="https://www.redditstatic.com/desktop2x/img/id-cards/snoo-home@2x.png"
              height="68px"
              width="40px"
              alt="reddit avatar"
            />
            <span>
              <h3 style={{ marginLeft: 10 }}>Home</h3>
            </span>
          </div>
          <p
            style={{
              marginLeft: 10,
              borderBottom: "1px solid #eeeeef",
              paddingBottom: 10,
            }}
          >
            Your personal Reddit frontpage. Come here to check in with your
            favorite communities.
          </p>
          <div
            style={{
              padding: "0 10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button className="primary-btn">Create Post</button>
            <button
              className="secondary-btn"
              onClick={() => setShowModal(true)}
            >
              Create Community
            </button>
          </div>
        </aside>
      )}
      {displayToast && (
        <ToastNotification
          text={state?.message}
          onHide={() => {
            setDisplayToast(false);
            window.history.replaceState(null, "");
          }}
        />
      )}
    </div>
  );
};

export default Home;
