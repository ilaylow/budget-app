import React, {useState} from "react";
import {Form, Button} from "react-bootstrap";
import styles from "./login.module.css";

const initialState = {email: "", password: ""}

export const Login = () => {

    const [userState, setUserState] = useState(initialState);

    const handleInput = (event) => {
        setUserState({...userState, [event.target.name]: event.target.value})
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
                        <Form.Control name="email" type="password" placeholder="Password" onChange={handleInput}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="Stay Signed In" />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>

            </div>
        </div>
        
    )
}