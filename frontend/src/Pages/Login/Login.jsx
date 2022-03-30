import React, {useState, useEffect} from "react";
import {Form, Button} from "react-bootstrap";
import styles from "./login.module.css";
import { signIn, signUp } from "../../api";

const initialState = {email: "", password: ""}

let isLoggedIn = false;

export const Login = () => {
{/* <Redirect to="/somewhere/else" />
to: object */}

    useEffect(() => {
        
    });

    const [userState, setUserState] = useState(initialState);

    const handleInput = (event) => {
        setUserState({...userState, [event.target.name]: event.target.value})
    }

    const login = (event) => {
        event.preventDefault();
        console.log(userState);
        signIn(userState).then((response) => {
            console.log(response.data);
            // User successfully logged in

        }).catch((err) => {
            console.error(err.response.data);
        })
    }

    return (
        <div>
            <h1 className = {styles.welcome}>Welcome to Budget-App.io</h1>

            <div className={styles.login}>
                <Form>
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
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="Stay Signed In" />
                    </Form.Group>
                    <Button variant="primary" type="submit" onClick={login}>
                        Submit
                    </Button>
                </Form>

            </div>
        </div>
        
    )
}