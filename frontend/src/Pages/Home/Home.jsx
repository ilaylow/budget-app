import React, {useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getWithExpiry } from "../../Helper/helperToken";
import {Form, Button} from "react-bootstrap";
import { logOut } from "../../Helper/helperToken";
import { getUserBudget, getUserExpenses } from "../../Helper/helperUser";

export const Home = () => {

    const isLoggedIn = getWithExpiry("token");

    useEffect(async () => {
    
        const userId = getWithExpiry("user_ID");
        const token = getWithExpiry("token");

        console.log(userId);

        getUserBudget(userId, token).then((res) => {
            console.log(res.data)
        }).catch((err) => {
            console.log(err.response);
        });

        getUserExpenses(userId, token).then((res) => {
             console.log(res.data)
        }).catch((err) => {
            console.log(err.response);
        })

    }, [])

    return (
        <div>
            {
                isLoggedIn
            ?   <h1>Welcome to the home page!</h1>
            :   <Navigate to="/login" />
                
            }
            <Button href = "/login" variant="danger" type="submit"  onClick={logOut}>
                        Sign Out
            </Button>
        </div>
    )
}