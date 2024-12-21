import { registerAs } from "@nestjs/config";

export default registerAs("FortyTwoOAuth", ()=>({
    clientID: process.env.FT_CLIENT_ID,
    clientSecret: process.env.FT_CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URL,
}));