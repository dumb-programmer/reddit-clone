import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from "./components/SignupForm";
import Home from './components/Home';
import Community from './components/Community';
import CreatePost from './components/CreatePost';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/r/:communityName" element={<Community />} />
        <Route path="/r/:communityName/submit" element={<CreatePost />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
