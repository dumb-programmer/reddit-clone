import { useEffect, useState } from "react";
import CreateCommunityModal from "./CreateCommunityModal";
import Header from "./Header";
import "../styles/Home.css";
import { getAllPosts } from "../firebase";
import Post from "./Post";

const Home = () => {
    const [showModal, setShowModal] = useState(false);
    const username = localStorage.getItem("username");
    const [data, setData] = useState([]);

    useEffect(() => {
        getAllPosts().then(snapshot => setData(snapshot));
    }, []);

    const loading = Object.keys(data).length === 0;
    console.log(data);
    return (
        <>
            <Header />
            <main className="posts-container">
                {
                    showModal && <CreateCommunityModal username={username} onExit={() => setShowModal(false)} />
                }
                <div className="posts">
                    {
                        !loading && <div className="posts" style={{ marginTop: 15 }}>
                            {data.map((post) => (<Post key={post.id} data={post} />))}
                        </div>
                    }
                </div>
                {
                    username && <aside className="main-btns">
                        <img src="https://www.redditstatic.com/desktop2x/img/id-cards/home-banner@2x.png" alt="banner art" />
                        <div style={{ display: "flex" }}>
                            <img id="reddit-avatar" src="https://www.redditstatic.com/desktop2x/img/id-cards/snoo-home@2x.png" height="68px" width="40px" alt="reddit avatar" />
                            <span><h3 style={{ marginLeft: 10 }}>Home</h3></span>
                        </div>
                        <p style={{ marginLeft: 10, borderBottom: "1px solid #eeeeef", paddingBottom: 10 }}>Your personal Reddit frontpage. Come here to check in with your favorite communities.</p>
                        <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button className="primary-btn">Create Post</button>
                            <button className="secondary-btn" onClick={() => setShowModal(true)}>Create Community</button>
                        </div>
                    </aside>
                }
            </main >
        </>
    );
};

export default Home;