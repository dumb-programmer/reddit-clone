import Header from "./Header";

const CreatePost = () => {
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
                                <input type="text" className="form-input" style={{ width: "96.5%", marginBottom: 20 }} placeholder="Title" maxLength={30} />
                                <textarea placeholder="Text(optional)" className="form-input" style={{ width: "96.5%", height: 100 }} />
                            </form>
                        </div>
                        <div className="post-creator-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginRight: 10 }}>
                            <button className="secondary-btn">Cancel</button>
                            <button className="primary-btn" style={{ width: 70 }}>Post</button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
};

export default CreatePost;