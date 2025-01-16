import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/login/index";
import Logout from "./pages/login/LogoutButton";
import UpdateUser from "./pages/updateUser/updateUser.tsx";
import { Chat } from "./chat/Chat.jsx"
import EnableTwoFactorAuth from './pages/login/EnableTwoFactorAuth.tsx';
import DisableTwoFactorAuth from './pages/login/DisableTwoFactorAuth';
import TwoFactorAuth from './pages/login/TwoFactorAuth';
import Profile from './pages/user/Profile';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';


function App() {
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate(); // Hook to navigate


  if (params.has('access_token')) {
    console.log("Setting access token in local storage");
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
      <Route path="logout" element={<Logout />}/>
      <Route path="/update" element={<UpdateUser />} />
      <Route path='/chat' element={<Chat />}/>
      <Route path="/profile/:id" element={<Profile />} />
      <Route path='/2fa/turn-on' element={<EnableTwoFactorAuth />} />
      <Route path='/2fa/turn-off' element={<DisableTwoFactorAuth />} />
      <Route path='/2fa/authenticate' element={<TwoFactorAuth />} />
    </Routes>
  );
}

export default App;

