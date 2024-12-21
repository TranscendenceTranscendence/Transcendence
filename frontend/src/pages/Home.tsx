import React, { useEffect } from "react";
import { useApi } from "../utils/api";

const Home = () => {
    const api = useApi();
    useEffect(() => {
        console.log("Home page");
        document.title = "Pong Game";
        api.App.appGetHello().then((response) => {
            console.log(response);
        }).catch((error) => {
            console.error(error);
        })  
    }, [
        api.App
    ]);
    return (
        <div>Pong game</div>
    )
}

export default Home