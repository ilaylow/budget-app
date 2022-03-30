import React, {useState, useEffect} from "react";
import {Form, Button} from "react-bootstrap";
import styles from "./SignUp.module.css";
import { signUp } from "../../api";
import { Navigate } from "react-router-dom";

const initialState = {name: "", email: "", password: "", user_type:"USER"}

export const SignUp = () => {

    useEffect(() => {
        if (localStorage.getItem("Token")){
            //setLoggedIn(true);
        }
    }, []);

    const [userState, setUserState] = useState(initialState);
    const [isLoggedIn, setLoggedIn] = useState(false);

    const handleInput = (event) => {
        setUserState({...userState, [event.target.name]: event.target.value})
    }

    const signup = (event) => {
        event.preventDefault();
        console.log(userState);
        signUp(userState).then((response) => {
            // User successfully logged in
            const data = response.data;
            console.log(data);
            setLoggedIn(true);

        }).catch((err) => {
            console.error(err.response);
        })
    }

    return (
        
        <div>
            { !isLoggedIn
            ? <div>
            <h1 className = {styles.welcome}>Welcome to Budget-App.io (Sign Up)</h1>

            <div className={styles.signup}>
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="name" name="name" placeholder="Enter Name" onChange={handleInput}/>
                        <Form.Text className="text-muted">
                        Please give your Full Name
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" name="email" placeholder="Enter email" onChange={handleInput}/>
                        <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control name="password" type="password" placeholder="Password" onChange={handleInput}/>
                    </Form.Group>

                    <Button variant="primary" type="submit" onClick={signup}>
                        Submit
                    </Button>
                </Form>

                </div>
            </div>
            : <Navigate to="/home"/>}

            
        </div>

        
        
    )
}