import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
    const navigate = useNavigate();
    return (
        <>
            <header className="nav-bar">
                <div className="logo">
                    
                </div>
                <input type="text" id="search-bar" placeholder="Search Reddit" />
                <div className="header-btns">
                    <button className="btn" id="sign-up-btn" onClick={() => navigate("signup")}>Sign Up</button>
                    <button className="btn" id="login-btn" onClick={() => navigate("login")}>Log In</button>
                </div>
            </header>
            <main className="posts">

            </main>
        </>
    );
};

export default Home;