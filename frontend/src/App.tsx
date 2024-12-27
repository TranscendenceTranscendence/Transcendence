import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/login/index";
import UpdateUser from "./pages/updateUser/updateUser.tsx";
import { Chat } from "./chat/Chat.jsx"
// import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/update" element={<UpdateUser />} />
      <Route path='/chat' element={<Chat />}/>
    </Routes>
  );
}

export default App;

