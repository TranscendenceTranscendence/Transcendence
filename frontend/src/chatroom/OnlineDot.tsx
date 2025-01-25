import React from "react";
import '../css/ChatDot.css'

export const OnlineDot = ({ status }: { status: boolean }) => {
    if (status)
    {
        return(
            <div className="StatusOnline">
                <p>online</p>
            </div>
        );
    }
    return(
        <div className="StatusOffline">
            <p>offine</p>
        </div>
    )
}