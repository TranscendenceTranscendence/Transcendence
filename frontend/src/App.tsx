import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/login/index";
import UpdateUser from "./pages/updateUser/updateUser.tsx";
import { Chat } from "./chat/Chat.jsx"
import TwoFactorAuth from './pages/login/TwoFactorAuth';
import DisableTwoFactorAuth from './pages/login/DisableTwoFactorAuth';
import Profile from './pages/user/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/update" element={<UpdateUser />} />
      <Route path='/chat' element={<Chat />}/>
      <Route path="/profile/:id" element={<Profile />} />
      <Route path='/2fa/turn-on' element={<TwoFactorAuth />} />
      <Route path='/2fa/turn-off' element={<DisableTwoFactorAuth />} />
    </Routes>
  );
}

export default App;

