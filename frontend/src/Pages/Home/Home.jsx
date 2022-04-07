import React, {useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getWithExpiry } from "../../Helper/helperToken";
import {Form, Button, Card, Table, InputGroup, FormControl} from "react-bootstrap";
import { logOut } from "../../Helper/helperToken";
import { getUserBudget, getUserExpenses, deleteUserExpense, createUserExpense, deleteUserBudget, updateUserBudget } from "../../Helper/helperUser";
import styles from "./home.module.css"
import "./coffee.css";

let userBudget = null;
let userExpenses = [];

let initialExpenseState = {"name": "", "cost": "", "expense_date": ""}
let initialUpdateBudgetState = {"user_amount": "", "daily_increase": "", "save_percentage": ""}

export const Home = () => {

    const isLoggedIn = getWithExpiry("token");
    const [budgetLoaded, setBudgetLoaded] = useState(false);
    const [expensesLoaded, setExpensesLoaded] = useState(false);
    const [expenseState, setExpenseState] = useState(initialExpenseState);
    const [isEditingBudget, setEditingBudget] = useState(false);
    const [updateBudgetState, setUpdateBudgetState] = useState(initialUpdateBudgetState);

    const handleDelete = (event) => {

        deleteUserExpense(event.target.name, isLoggedIn).then((res) => {
            console.log(res);
            console.log("Delete expense Successfully!")
            window.location.reload(false);

            // Reload page
        }).catch((err) => {
            console.log(err);
        });
    }

    const handleBudgetDelete = (event) => {
        deleteUserBudget(userBudget["ID"], isLoggedIn).then((res) => {
            console.log(res);
            console.log("Delete Budget Successfully!")
            window.location.reload(false);

            // Reload page
        }).catch((err) => {
            console.log(err);
        });
    }

    const handleExpenseInput = (event) => {
        console.log(expenseState);
        setExpenseState({...expenseState, [event.target.name]: event.target.value})
    }

    const handleSetEditingBudget = (event) => {
        setEditingBudget(true);
    }

    const handleCreateExpense = (event) => {
        expenseState["user_id"] = getWithExpiry("user_ID");

        createUserExpense(expenseState, isLoggedIn).then((res) => {
            console.log(res)
            console.log("Created Expense Successfully!")
            window.location.reload(false);

        }).catch((err) => {
            console.log(err)
            console.log("Something went wrong creating an expense...")
        })
    }

    const handleUpdateBudget = (event) => {
        updateBudgetState["user_id"] = getWithExpiry("user_ID")
        updateBudgetState["budget_id"] = userBudget["ID"]

        updateUserBudget(updateBudgetState, isLoggedIn).then((res) => {
            console.log(res);
            console.log("Updated User Budget successfully!")
            window.location.reload(false)
            
        }).catch((err) => {
            console.log(err);
        })
    }

    const handleUpdateBudgetInput = (event) => {
        setUpdateBudgetState({...updateBudgetState, [event.target.name]: event.target.value})
    }

    useEffect(async () => {
    
        const userId = getWithExpiry("user_ID");
        const token = getWithExpiry("token");

        console.log(userId);

        getUserBudget(userId, token).then((res) => {
            console.log(res.data)
            userBudget = res.data;
            userBudget["user_amount"] = userBudget["user_amount"].toFixed(2);

            setBudgetLoaded(true);
        }).catch((err) => {
            console.log(err.response);
        });

        getUserExpenses(userId, token).then((res) => {
            userExpenses = res.data.expenses;
            // Reverse the list of expenses here so we have the latest on the top
            userExpenses.reverse();

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
                    ?   <>
                            {!isEditingBudget
                        ?   <Card style = {{marginLeft: "8%", marginRight: "8%", marginTop: "5%"}} className="text-center">
                                <Card.Header><h3>Budget:</h3></Card.Header>
                                <Card.Body>
                                    <Card.Title>Amount Left: {budgetLoaded ? "$"+userBudget["user_amount"] : "" }</Card.Title>
                                    <Card.Text>
                                    Target Save Percentage: {budgetLoaded ? userBudget["save_percentage"] + "%" : ""}
                                    </Card.Text>
                                    <Card.Text>
                                    Daily Increase: {budgetLoaded ? "$"+userBudget["daily_increase"] : ""}
                                    </Card.Text>
                                    <Button active variant="primary" onClick = {(() => setEditingBudget(true))}>Edit budget</Button>
                                    <Button style = {{marginLeft: "2%"}} onClick = {handleBudgetDelete} active variant="danger">Delete budget</Button>
                                </Card.Body>
                                <Card.Footer className="text-muted">Last Updated: 16/11/2001</Card.Footer>
                            </Card>
                        :    
                            <Card style = {{marginLeft: "8%", marginRight: "8%", marginTop: "5%"}} className="text-center">
                                <Card.Header><h3>Budget:</h3></Card.Header>
                                <Card.Body style = {{marginRight: "20%", marginLeft: "20%"}}>
                                    <InputGroup size="sm" className="mb-3">
                                        <InputGroup.Text  id="inputGroup-sizing-sm">New User Amount ($)</InputGroup.Text>
                                        <FormControl name = "user_amount" onChange = {handleUpdateBudgetInput} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
                                    </InputGroup>
                                    <InputGroup size="sm" className="mb-3">
                                        <InputGroup.Text  id="inputGroup-sizing-sm">New Daily Increase ($)</InputGroup.Text>
                                        <FormControl name = "daily_increase" onChange = {handleUpdateBudgetInput} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
                                    </InputGroup>
                                    <InputGroup size="sm" className="mb-3">
                                        <InputGroup.Text  id="inputGroup-sizing-sm">New Save Percentage (%)</InputGroup.Text>
                                        <FormControl name = "save_percentage" onChange = {handleUpdateBudgetInput} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
                                    </InputGroup>
                                    <Button onClick = {handleUpdateBudget} active variant="primary">Update budget</Button>
                                    <Button style = {{marginLeft: "2%"}} onClick = {(() => setEditingBudget(false))} active variant="danger">Cancel </Button>
                                </Card.Body>
                                
                            </Card>
                                                        
                            }
                        </>
                    : 
                        <Card style = {{marginLeft: "8%", marginRight: "8%", marginTop: "5%"}} className="text-center">
                            <Card.Header><h4>User has no budget created!</h4></Card.Header>
                            <Card.Body>
                                <Button href = "/create_budget" active variant="primary">Create Budget</Button>
                            </Card.Body>
                        </Card>
                        }
                    </div>

                    <div style = {{marginLeft: "20%", marginRight: "20%", marginTop: "3%"}}>
                        {userExpenses
                    ?   
                        <div>
                            <Table responsive="lg" >
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Cost</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                        {userExpenses.map((expense, i) => 
                                        <tr key = {i}>
                                            <td>
                                                {expense["name"]}
                                            </td>
                                            <td>
                                                {expense["cost"]}
                                            </td>
                                            <td>
                                                {expense["expense_date"]}
                                            </td>
                                            <td>
                                            <Button key = {i} name={expense["ID"]} variant="danger" type="submit" size="xs" active onClick = {handleDelete}>
                                                Delete
                                            </Button>
                                            </td>
                                            
                                        </tr>)}
                                </tbody>
                            </Table>
                      </div>
                    : 
                        <h2 style = {{marginLeft: "20%", opacity: "50%"}}>You currently have no expenses created!</h2>
                        }
                    </div>
                </div>
            
            :   <Navigate to="/login" />
                
            }
            {userBudget
        ?   <div style = {{marginLeft: "40%", marginRight: "40%", marginTop: "3%", marginBottom: "10%"}}>
                <div className="input-group input-group-sm mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="inputGroup-sizing-sm">Name:</span>
                    </div>
                <input name = "name" type="text" className="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" onChange={handleExpenseInput}/>
                </div>
                <div className="input-group input-group-sm mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="inputGroup-sizing-sm">Cost:</span>
                    </div>
                <input name = "cost" type="text" className="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" onChange={handleExpenseInput}/>
                </div>
                <div className="input-group input-group-sm mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="inputGroup-sizing-sm">Date:</span>
                    </div>
                <input name = "expense_date" placeholder="dd/mm/yy" type="text" className="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" onChange={handleExpenseInput}/>
                </div>

                <Button variant = "secondary" onClick={handleCreateExpense}>
                    Add Expense
                </Button>
            </div>
        :   <></>
        }
    
        </div>
    )
}