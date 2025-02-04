import * as generatedApi from '../../generated-api/index';

export interface ApiInterface {
    Auth: generatedApi.AuthApi;
    Users: generatedApi.UsersApi;
    Achievements: generatedApi.AchievementsApi;
    Blockeds: generatedApi.BlockedsApi;
    ChatMessages: generatedApi.ChatMessagesApi;
    ChatParticipants: generatedApi.ChatParticipantsApi;
    ChatRooms: generatedApi.ChatRoomsApi;
    Friends: generatedApi.FriendsApi;
    Games: generatedApi.GamesApi;
    Queue: generatedApi.QueueApi;
    FileUpload: generatedApi.FileUploadApi;
    App: generatedApi.AppApi;
    TwoFactorAuthentication: generatedApi.TwoFactorAuthenticationApi;
}
