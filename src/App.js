import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from "./components/SignupForm";
import Home from './components/Home';
import './App.css';
import Community from './components/Community';
import CreatePost from './components/CreatePost';

function App() {
  const [user, setUser] = useState({});
  const [username, setUsername] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home user={user} username={username} setUser={setUser} setUsername={setUsername} />} />
        <Route path="/login" element={<LoginForm setUsername={setUsername} />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/r/:communityName" element={<Community user={user} username={username} />} />
        <Route path="/r/:communityName/submit" element={<CreatePost />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
