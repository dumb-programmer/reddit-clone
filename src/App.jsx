import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Community from "./components/Community";
import CreatePost from "./components/CreatePost";
import MainLayout from "./components/MainLayout";
import AuthContext from "./context/AuthContext";
import { registerAuthObserver } from "./firebase";
import Profile from "./components/Profile";
import PostDetails from "./components/PostDetails";
import Settings from "./components/Settings";
import Search from "./components/Search";
import "./App.css";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    const unsub = registerAuthObserver((authUser) => {
      setUser(authUser);
      localStorage.setItem("user", JSON.stringify(authUser));
    });

    return () => {
      unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={user}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/r/:communityName/:postId" element={<PostDetails />} />
          <Route path="/user/:username" element={<Profile />} />
          <Route path="/r/:communityName" element={<Community />} />
          <Route path="/r/:communityName/submit" element={<CreatePost />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/search" element={<Search />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
