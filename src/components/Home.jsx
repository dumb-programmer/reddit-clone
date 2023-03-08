import { useContext, useEffect, useState } from "react";
import CreateCommunityModal from "./CreateCommunityModal";
import { getAllPosts } from "../firebase";
import AuthContext from "../context/AuthContext";
import Posts from "./Posts";
import "../styles/Home.css";

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const username = localStorage.getItem("username");
  const [data, setData] = useState(null);
  const authenticated = useContext(AuthContext);

  useEffect(() => {
    let ignore = false;
    getAllPosts().then((snapshot) => {
      if (!ignore) {
        setData(snapshot);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "1rem",
        marginTop: 90,
        marginLeft: 100,
        marginRight: 100,
      }}
    >
      {showModal && (
        <CreateCommunityModal
          username={username}
          onExit={() => setShowModal(false)}
        />
      )}
      <Posts data={data} setData={setData} fetchPosts={getAllPosts} />
      {authenticated && (
        <aside className="main-btns">
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
    </div>
  );
};

export default Home;
