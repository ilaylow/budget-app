import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { getWithExpiry } from "../../Helper/helperToken";
import { createUserBudget } from "../../Helper/helperUser";
import styles from "./budget.module.css"


let initialBudgetState = {"user_amount": "", "save_percentage": "", "daily_increase": ""}

export const CreateBudget = () => {
    
    const isLoggedIn = getWithExpiry("token");
    const [budgetState, setBudgetState] = useState(initialBudgetState)
    const navigate = useNavigate();

    const handleInput = (event) => {
        setBudgetState({...budgetState, [event.target.name]: event.target.value})
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        budgetState["user_id"] = getWithExpiry("user_ID");

        createUserBudget(budgetState, isLoggedIn).then((res) => {
            console.log(res)
            console.log("Budget created successfully")
            navigate("/home")

        }).catch((err) => {
            console.log(err)
        })
    }

    return(
        <div>
        {
            isLoggedIn
        ?  <Form className = {styles.createform}>
            <h1 style = {{marginBottom: "5%"}}>Create Your Budget!</h1>
                <Form.Group className="mb-3">
                    <Form.Label>User Amount</Form.Label>
                    <Form.Control name="user_amount" placeholder="e.g. 1500" onChange={handleInput}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Save Percentage</Form.Label>
                    <Form.Control name="save_percentage" placeholder="0-100%" onChange={handleInput}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Daily Increase</Form.Label>
                    <Form.Control name="daily_increase" placeholder="e.g. 50" onChange={handleInput}/>
                </Form.Group>

                <Button variant="primary" type="submit" size="lg" active onClick={handleSubmit}>
                    Create Budget
                </Button>
                    
            </Form>
        :   <Navigate to="/login" />
        }
        </div>
        
    )
}