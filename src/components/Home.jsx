import { useState } from "react";
import CreateCommunityModal from "./CreateCommunityModal";
import Header from "./Header";
import "../styles/Home.css";

const Home = () => {
    const [showModal, setShowModal] = useState(false);
    const username = localStorage.getItem("username");

    return (
        <>
            <Header />
            <main className="posts-container">
                {
                    showModal && <CreateCommunityModal username={username} onExit={() => setShowModal(false)} />
                }
                <div className="posts">
                    {Array.from({ length: 10 }).map((idx) => (
                        <div key={idx} className="post">
                            <div className="post-sidebar">
                                <button className="upvote-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg></button>
                                <p>26.4k</p>
                                <button className="downvote-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg></button>
                            </div>
                            <div className="post-main">
                                <div className="post-header">
                                    <p>
                                        <b>r/AskReddit</b>
                                        <span> Posted by u/dog_red472 15 hrs ago </span>
                                    </p>
                                </div>
                                <div className="post-title"><h3>Hello There</h3></div>
                                <div className="post-body"></div>
                            </div>
                        </div>))}
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