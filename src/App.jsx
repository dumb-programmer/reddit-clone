import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Community from "./components/community/Community";
import CreatePost from "./components/post/CreatePost";
import MainLayout from "./components/MainLayout";
import AuthContext from "./context/AuthContext";
import { registerAuthObserver } from "./firebase";
import Profile from "./components/Profile";
import PostDetails from "./components/post/PostDetails";
import Settings from "./components/settings/Settings";
import Search from "./components/search/Search";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    const unsub = registerAuthObserver((auth) => {
      if (auth) {
        setUser(auth);
        localStorage.setItem("user", JSON.stringify(auth));
      }
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
          <Route
            path="/r/:communityName/submit"
            element={
              <ProtectedRoute isLoggedIn={user}>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute isLoggedIn={user}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<Search />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
