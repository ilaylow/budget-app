import React, {useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const Home = () => {

    const [isLoggedIn, setLoggedIn] = useState(false); 

    useEffect(() => {
        if (localStorage.getItem("Token")){
            setLoggedIn(true);
        }
    }, []);

    return (
        <div>
            {
                isLoggedIn
            ?   <h1>Welcome to the home page!</h1>
            :   <h1>You are not logged in!</h1>
                
            }
        </div>
    )
}