import * as generatedApi from '../../generated-api/index';
import Cookies from 'js-cookie';


export const useApi = () => {
    // get the token from cookies
    const token = Cookies.get('jwt');
    const config = new generatedApi.Configuration({
        basePath: process.env.REACT_APP_API_URL,
        headers: {
            'Authorization': `Bearer ${token || 'badbadbadbadbadbadbad'}`,
        },
    });
    const api = {
        Auth: new generatedApi.AuthApi(config),
        Users: new generatedApi.UsersApi(config),
        Achievements: new generatedApi.AchievementsApi(config),
        Blockeds: new generatedApi.BlockedsApi(config),
        ChatMessages: new generatedApi.ChatMessagesApi(config),
        ChatParticipants: new generatedApi.ChatParticipantsApi(config),
        ChatRooms: new generatedApi.ChatRoomsApi(config),
        Friends: new generatedApi.FriendsApi(config),
        Games: new generatedApi.GamesApi(config),
        Queue: new generatedApi.QueueApi(config),
        FileUpload: new generatedApi.FileUploadApi(config),
        App: new generatedApi.AppApi(config),
    }
    return api;
}

