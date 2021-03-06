import React, {useEffect, useState} from "react";
import {Form, Button} from "react-bootstrap";
import styles from "./login.module.css";
import { signIn } from "../../Helper/helperUser";
import { Navigate } from "react-router-dom";
import { setWithExpiry, getWithExpiry } from "../../Helper/helperToken";

const initialState = {email: "", password: ""}
const HOUR_TO_MILLISECONDS = 1000 * 60 * 60

export const Login = () => {

    const [isLoggedIn, setLoggedIn] = useState(getWithExpiry("token"));
    const [wrongPassword, setWrongPassword] = useState(getWithExpiry(false));
    const [userState, setUserState] = useState(initialState);

    const handleInput = (event) => {
        setUserState({...userState, [event.target.name]: event.target.value})
    }

    const login = (event) => {
        event.preventDefault();
        console.log(userState);
        signIn(userState).then((response) => {
            // User successfully logged in
            const data = response.data;
            console.log(data);

            setWithExpiry("user_ID", data["user_id"], HOUR_TO_MILLISECONDS);
            setWithExpiry("user_Type", data["user_type"], HOUR_TO_MILLISECONDS);
            setWithExpiry("token", data["token"], HOUR_TO_MILLISECONDS);
            setWithExpiry("refresh_token", data["refresh_token"], HOUR_TO_MILLISECONDS);
            
            setLoggedIn(true);

        }).catch((err) => {
            console.log(err.response);
            setWrongPassword(true)
        })
    }

    return (
        
        <div>
            { !isLoggedIn 
            ? <div>
            <h1 className = {styles.welcome}>Welcome to Budget-App.io (Log In)</h1>

            <div className={styles.login}>
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" name="email" placeholder="Enter email" onChange={handleInput}/>
                        <Form.Text className="text-muted">
                        We'll never share your email with anyone else. But we will for your password...
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control name="password" type="password" placeholder="Password" onChange={handleInput}/>
                    </Form.Group>
                    <span>
                        <p>Don't have an account? Click <a href="/signup">here</a></p>
                    </span>
                    <span>
                        <p style = {{fontSize: "90%"}}>Forgot your password? Click <a href="/forgot_password">here</a></p>
                    </span>
                    {wrongPassword && <p style={{color: "red"}}>Incorrect email or password entered!</p>}
                    <Button variant="primary" type="submit" size="lg" active onClick={login}>
                        Login
                    </Button>
                    
                </Form>

                </div>
            </div>
            : <Navigate to="/home"/>}

            
        </div>

        
        
    )
}