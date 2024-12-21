import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {
  User,
  UsersApi
} from "../../generated-api";

// interface User {
//   nickname: string;
//   avatar: string;
//   email: string;
//   enable_two_factor: boolean;
//   ladder_level: number;
//   user_status: string;
// }

export default function Profile() {
  const {id} = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = new UsersApi()

    const userIdNumber = Number(id);
    if (isNaN(userIdNumber)) {
      setError('Invalid user ID');
      return;
    }
    // Fetch user data from the back/end
    api.usersControllerFindOne({id: userIdNumber})
      .then((user) => {
        setUser(user);
        console.log('user:', user);
      })
      .catch(error => {
        console.error('Failed to fetch user data:', error);
      });
    // axios({
    //   url: `https://localhost:3000/users/${userIdNumber}`,
    //   method: 'GET',
    //   withCredentials: true,
    // })
    //   .then(({
    //            data
    //          }) => {
    //     setUser({
    //       nickname: data.nickname,
    //       avatar: data.avatar,
    //       email: data.email,
    //       enable_two_factor: data.enable_two_factor,
    //       ladder_level: data.ladder_level,
    //       user_status: data.user_status,
    //     });
    //     console.log('User id:', id); // Log the entire user object
    //     console.log('User data:', data); // Log the entire user object
    //     console.log('User avatar:', data.avatar); // Log the user avatar value
    //     console.log('User nickname:', data.nickname); // Log the user nickname value
    //   })
    //   .catch(error => {
    //     console.error('Failed to fetch user data:', error);
    //   });
  }, [ id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Status: {user.userStatus}</p>
      <div>
        <img src={`data:image/jpeg;base64, ${user.avatar}`} alt="User Avatar"
             style={{width: '100px', height: '140px', borderRadius: '10%'}}/>
      </div>
      <div>
        <h2>{user.nickname || 'undefined'}</h2>
        <h3>Level: {user.ladderLevel}</h3>
      </div>
      <div>
        <p>Email: {user.email || 'undefined'}</p>
        <p>Two factor Authentication: {user.enableTwoFactor ? 'Enabled' : 'Disabled'}</p>
      </div>
    </div>
  );
}

