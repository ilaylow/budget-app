import React, {useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getWithExpiry } from "../../Helper/helperToken";
import {Form, Button, Card, ListGroup, ListGroupItem} from "react-bootstrap";
import { logOut } from "../../Helper/helperToken";
import { getUserBudget, getUserExpenses } from "../../Helper/helperUser";
import styles from "./home.module.css"
import "./coffee.css";

let userBudget = {}
let userExpenses = [];

export const Home = () => {

    const isLoggedIn = getWithExpiry("token");
    const [budgetLoaded, setBudgetLoaded] = useState(false);
    const [expensesLoaded, setExpensesLoaded] = useState(false);

    useEffect(async () => {
    
        const userId = getWithExpiry("user_ID");
        const token = getWithExpiry("token");

        console.log(userId);

        getUserBudget(userId, token).then((res) => {
            console.log(res.data)
            userBudget = res.data;
            setBudgetLoaded(true);
        }).catch((err) => {
            console.log(err.response);
        });

        getUserExpenses(userId, token).then((res) => {
             userExpenses = res.data.expenses;
             console.log(userExpenses);
             setExpensesLoaded(true);
        }).catch((err) => {
            console.log(err.response);
        })

    }, [])

    return (
        <div>
            {
                isLoggedIn
            ?   <div>
                    <div className={styles.welcome}>
                        <h1>Welcome to the Home Page!</h1>
                        <Button style={{marginTop:"0.5%", marginBottom: "0%"}} href = "/login" variant="danger" type="submit" size="lg" active onClick={logOut}>
                                Sign Out
                        </Button>
                    </div>

                    <div>
                        {userBudget
                        ? <Card style = {{marginLeft: "8%", marginRight: "8%", marginTop: "5%"}} className="text-center">
                            <Card.Header><h3>Budget:</h3></Card.Header>
                            <Card.Body>
                                <Card.Title>Amount Left: {budgetLoaded ? "$"+userBudget["user_amount"] : "" }</Card.Title>
                                <Card.Text>
                                Save Percentage: {budgetLoaded ? userBudget["save_percentage"] + "%" : ""}
                                </Card.Text>
                                <Card.Text>
                                Weekly Limit: {budgetLoaded ? "$"+userBudget["weekly_limit"] : ""}
                                </Card.Text>
                                <Button active variant="primary">Edit budget</Button>
                            </Card.Body>
                            <Card.Footer className="text-muted">Last Updated: 16/11/2001</Card.Footer>
                        </Card>
                    : 
                        <Card style = {{marginLeft: "8%", marginRight: "8%", marginTop: "5%"}} className="text-center">
                            <Card.Header><h4>User has no budget created!</h4></Card.Header>
                            <Card.Body>
                                <Button active variant="primary">Create Budget</Button>
                            </Card.Body>
                        </Card>
                        }
                    </div>

                    <div>
                        {userExpenses
                    ?   <ListGroup variant="flush" style = {{marginLeft: "20%", marginRight: "20%", marginTop: "3%"}}>
                            <ListGroup.Item >{"Name"}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {"Cost"}</ListGroup.Item>
                            {
                            userExpenses.map((expense, i) => <ListGroup.Item key={i}>{expense["name"]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {expense["cost"]}</ListGroup.Item>)
                            }
                        </ListGroup>
                    : 
                        <h1>Expenses not here</h1>
                        }
                    </div>
                </div>
            
            :   <Navigate to="/login" />
                
            }
        
        </div>
    )
}