import { useState } from "react";
import { useParams } from "react-router-dom";
import { createPost } from "../firebase";
import Header from "./Header";

const CreatePost = () => {
    const [data, setData] = useState({
        title: "",
        content: "",
    });
    const [loading, setLoading] = useState(false);
    const { communityName } = useParams();
    const [username, setUsername] = useState(localStorage.getItem("username"));

    const handleInput = (e) => {
        if (e.target.name === "title" && e.target.value.length < 301) {
            setData({
                ...data,
                title: e.target.value
            });
        }
        else {
            setData({
                ...data,
                content: e.target.value
            });
        }
    };

    const handleSubmit = async (e) => {
        if (data.title.length > 0) {
            setLoading(true);
            await createPost({ ...data, username: username, communityName: communityName });
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main style={{ paddingTop: 100, height: "100%", backgroundColor: "#dae0e6", display: "flex", justifyContent: "center" }}>
                <div style={{ width: 700 }}>
                    <h2 style={{ fontSize: 18, borderBottom: "1.5px solid #edeff1", paddingBottom: 20, paddingLeft: 10 }}>Create a post</h2>
                    <div style={{ backgroundColor: "#fff", paddingBottom: 10, borderRadius: 5 }}>
                        <div className="post-creator-header">

                        </div>
                        <div className="post-form" style={{ padding: 10 }}>
                            <form>
                                <div style={{ position: "relative" }}>
                                    <input type="text" name="title" className="form-input" style={{ width: "89%", marginBottom: 20, paddingRight: 65 }} placeholder="Title" maxLength={300} value={data.title} onChange={handleInput} required />
                                    <span style={{ position: "absolute", right: 5, top: 14, fontSize: 12, fontWeight: "bold", color: "#8e9092" }}>{data.title.length}/300</span>
                                </div>
                                <textarea placeholder="Text(optional)" name="content" className="form-input" style={{ width: "96.5%", height: 100 }} value={data.content} onChange={handleInput} />
                            </form>
                        </div>
                        <div className="post-creator-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginRight: 10 }}>
                            <button className="secondary-btn">Cancel</button>
                            <button className="primary-btn" style={{ width: 70 }} onClick={!loading ? handleSubmit : null} disabled={loading}>Post</button>
                        </div>
                    </div>
                </div>
                <aside className="community-sidebar">
                    <div className="community-sidebar__header" style={{ backgroundColor: "#0079d3", height: 20 }}></div>
                    <div style={{ display: 'flex', alignItems: "center", gap: 6, marginTop: 10, marginLeft: 10 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="50" width="50" style={{ fill: "#0079d3", backgroundColor: "#fff", borderRadius: "50%" }}>
                            <path d="M16.5,2.924,11.264,15.551H9.91L15.461,2.139h.074a9.721,9.721,0,1,0,.967.785ZM8.475,8.435a1.635,1.635,0,0,0-.233.868v4.2H6.629V6.2H8.174v.93h.041a2.927,2.927,0,0,1,1.008-.745,3.384,3.384,0,0,1,1.453-.294,3.244,3.244,0,0,1,.7.068,1.931,1.931,0,0,1,.458.151l-.656,1.558a2.174,2.174,0,0,0-1.067-.246,2.159,2.159,0,0,0-.981.215A1.59,1.59,0,0,0,8.475,8.435Z"></path>
                        </svg>
                        <h4>r/test</h4>
                    </div>
                    <div style={{ paddingLeft: 10 }}>
                        <p>Hello there from description</p>
                        <span style={{ color: "#818589" }}>Created {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date())}</span>
                        <p>{new Intl.NumberFormat("en-US", { notation: "compact" }).format(100000000)} Members</p>
                    </div>
                </aside>
            </main>
        </>
    )
};

export default CreatePost;