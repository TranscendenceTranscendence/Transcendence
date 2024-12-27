import React from 'react';
import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/login/index";
import UpdateUser from "./pages/updateUser/updateUser.tsx";
import Profile from './pages/user/Profile';
// import './App.css';

function App2() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/update" element={<UpdateUser />} />
      <Route path="/profile/:id" element={<Profile />} />
    </Routes>
  );
}

export default App2;