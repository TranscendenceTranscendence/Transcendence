import * as generatedApi from "../../generated-api/index";

export const useApi = () => {
  const config = new generatedApi.Configuration({
    basePath: process.env.REACT_APP_API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  const api = {
    Auth: new generatedApi.AuthApi(config),
    Users: new generatedApi.UsersApi(config),
    Achievements: new generatedApi.AchievementsApi(config),
    ChatMessages: new generatedApi.ChatMessagesApi(config),
    ChatParticipants: new generatedApi.ChatParticipantsApi(config),
    ChatRooms: new generatedApi.ChatRoomsApi(config),
    Friends: new generatedApi.FriendsApi(config),
    Games: new generatedApi.GamesApi(config),
    Queue: new generatedApi.QueueApi(config),
    FileUpload: new generatedApi.FileUploadApi(config),
    App: new generatedApi.AppApi(config),
    TwoFactorAuthentication: new generatedApi.TwoFactorAuthenticationApi(
      config,
    ),
    Statistics: new generatedApi.StatisticsApi(config),
    Invite: new generatedApi.InviteApi(config),
  };
  return api;
};
