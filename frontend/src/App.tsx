import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/login/index";
import UpdateUser from "./pages/updateUser/updateUser.tsx";
import { Chat } from "./chat/Chat.jsx"
import TwoFactorAuth from './pages/login/TwoFactorAuth';
import DisableTwoFactorAuth from './pages/login/DisableTwoFactorAuth';
import Profile from './pages/user/Profile';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';


function App() {
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate(); // Hook to navigate


  if (params.has('access_token')) {
    localStorage.setItem('access_token', params.get('access_token'));
    params.delete('access_token');
  }


  useEffect(() => {
    if (params.has('redirect')) {
      navigate(params.get('redirect'));
    }
  }, [params, navigate]);
    

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

