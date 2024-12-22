import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/login/index";
import UpdateUser from "./pages/updateUser";
import Profile from './pages/user/Profile';
import { Chat } from "./chat/Chat.jsx"
import TwoFactorAuth from './pages/login/TwoFactorAuth';
// import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/update" element={<UpdateUser />} />
      <Route path='/chat' element={<Chat />}/>
      <Route path="/profile/:id" element={<Profile />} />
      <Route path='/2fa' element={<TwoFactorAuth />} />
    </Routes>
  );
}

export default App;

