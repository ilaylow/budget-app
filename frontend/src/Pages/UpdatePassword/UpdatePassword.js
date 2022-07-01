import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { getWithExpiry } from "../../Helper/helperToken";
import { updateUserPassword } from "../../Helper/helperUser";
import styles from "./password.module.css"

let initialPasswordState = {"email": "", "initial_password": "", "updated_password": "", "confirm_updated_password": ""}

export const ForgotPassword = () => {
    
    const isLoggedIn = getWithExpiry("token");
    const [passwordState, setPasswordState] = useState(initialPasswordState)
    const [wrongPassword, setWrongPassword] = useState(false);
    const navigate = useNavigate();

    const handleInput = (event) => {
        setPasswordState({...passwordState, [event.target.name]: event.target.value})
    }

    const handleSubmit = (event) => {
        if (passwordState["updated_password"] != passwordState["confirm_updated_password"]){
            setWrongPassword(true);
        } else{
            setWrongPassword(false);
            updateUserPassword(passwordState);
        }

        event.preventDefault();

    }

    return(
        <div>
        <Button href = "/login" style = {{marginLeft: "4%", marginTop: "3%"}} size="lg" active variant ="danger">Back</Button>
        {
            !isLoggedIn
        ?  
            <Form className = {styles.createPasswordForm}>
            <h1 style = {{marginBottom: "5%"}}>Update Your Password</h1>
                <Form.Group className="mb-3">
                    <Form.Label>User Email</Form.Label>
                    <Form.Control name="email" type="email" onChange={handleInput}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Initial Password</Form.Label>
                    <Form.Control name="initial_password" type="password" onChange={handleInput}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control name="updated_password" type="password" onChange={handleInput}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control name="confirm_updated_password" type="password" onChange={handleInput}/>
                </Form.Group>

                {wrongPassword && <p style={{color: "red"}}>Passwords don't match!</p>}

                <Button style = {{marginTop: "2%"}} variant="primary" type="submit" size="lg" active onClick={handleSubmit}>
                    Update Password
                </Button>
                    
            </Form>
        :   <Navigate to="/login" />
        }
        </div>
        
    )
}