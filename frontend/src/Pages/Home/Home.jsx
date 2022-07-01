import React, {useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getWithExpiry } from "../../Helper/helperToken";
import {Button, Card, Table, InputGroup, FormControl} from "react-bootstrap";
import { logOut } from "../../Helper/helperToken";
import { getUserBudget, getUserExpenses, deleteUserExpense, createUserExpense, deleteUserBudget, updateUserBudget } from "../../Helper/helperUser";
import styles from "./home.module.css"
import { getTotalSavedFromExpenses, monthNames, processUserExpenses, sortExpenses } from "../../Helper/helperExpense";
import {ConfirmationModal} from "../../Components/ConfirmationModal";

let userBudget = null;
let userExpenses = [];
let shortenedExpenses = [];
let deleteFunction = null;
let expenseName = null;

let initialExpenseState = {"name": "", "cost": "", "expense_date": ""}
let initialUpdateBudgetState = {"user_amount": "", "daily_increase": "", "save_percentage": ""}

export const Home = () => {

    const isLoggedIn = getWithExpiry("token");
    const [budgetLoaded, setBudgetLoaded] = useState(false);
    const [expensesLoaded, setExpensesLoaded] = useState(false);
    const [expenseState, setExpenseState] = useState(initialExpenseState);
    const [isEditingBudget, setEditingBudget] = useState(false);
    const [updateBudgetState, setUpdateBudgetState] = useState(initialUpdateBudgetState);
    const [savedForCurrMonth, setSavedForCurrMonth] = useState(0);
    const [savingColor, setSavingColor] = useState("green");
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleShowDeleteExpense = (event) => {
        
        setShowConfirmation(true);
        expenseName = event.target.name;
        deleteFunction = handleDelete;
    }

    const handleShowDeleteBudget = (event) => {
        
        setShowConfirmation(true);
        deleteFunction = handleBudgetDelete;

    }

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

    useEffect(() => {
    
        const userId = getWithExpiry("user_ID");
        const token = getWithExpiry("token");

        console.log(userId);

        async function fetchUserData(){
            getUserBudget(userId, token).then((res) => {
                userBudget = res.data;
                userBudget["user_amount"] = userBudget["user_amount"].toFixed(2);

                updateBudgetState["user_amount"] = userBudget["user_amount"]
                updateBudgetState["daily_increase"] = userBudget["daily_increase"]
                updateBudgetState["save_percentage"] = userBudget["save_percentage"]
                
                setBudgetLoaded(true);

                getUserExpenses(userId, token).then((res) => {
                    userExpenses = res.data.expenses;
                    // Reverse the list of expenses here so we have the latest on the top
                    userExpenses = sortExpenses(userExpenses, "expense_date");
        
                    // Shorten so page isn't flooded when we get to 100s of expenses
                    shortenedExpenses = userExpenses.slice(0, 10);
        
                    // Process user expenses and get the most recent set
                    const currDate = new Date();
                    const currYear = currDate.getFullYear().toString()
                    const currMonth = monthNames[currDate.getMonth()]

                    const currYearExpenses = processUserExpenses(userExpenses)[currYear]
                    let totalSaved = 0;
                    if (currYearExpenses[currMonth]){
                        totalSaved = parseFloat(getTotalSavedFromExpenses(currYearExpenses[currMonth], userBudget["daily_increase"], -1, -1))
                    }
                    
                    setSavingColor(getSavingColor(totalSaved));
                    setSavedForCurrMonth(totalSaved);
                    setExpensesLoaded(true);
                }).catch((err) => {
                    console.log(err.response);
                })
            }).catch((err) => {
                console.log(err.response);
            });       
        }

        fetchUserData();
    }, [])

    const getSavingColor = (savings) => {
        const threshold = userBudget["daily_increase"] * new Date().getDate() * userBudget["save_percentage"] * 0.01;
        const threshold10Above = userBudget["daily_increase"] * new Date().getDate() * ((userBudget["save_percentage"] * 0.01) + 0.1);

        if (savings < threshold){
            return "red"
        }

        if (savings >= threshold && savings <= threshold10Above){
            return "orange"
        }

        return "green";
    }

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
                    <ConfirmationModal show = {showConfirmation} handleClose = {() => setShowConfirmation(false)} deleteItem = {deleteFunction} expenseName = {expenseName}/>
                    <div>
                        {userBudget
                    ?   <>
                            {!isEditingBudget
                        ?   <Card style = {{marginLeft: "8%", marginRight: "8%", marginTop: "5%"}} className="text-center">
                                <Card.Header><h3>Budget:</h3></Card.Header>
                                <Card.Body>
                                    <Card.Title>Amount Left: {budgetLoaded ? "$"+userBudget["user_amount"] : "" }</Card.Title>
                                    <Card.Title style = {{display: "inline-block"}}>Amount Saved (Month): </Card.Title>
                                    <Card.Title style = {{display: "inline-block", color: savingColor}}> &nbsp; {budgetLoaded ? "$"+savedForCurrMonth : "" }
                                    </Card.Title>
                                    <Card.Text>
                                    Target Save Percentage: {budgetLoaded ? userBudget["save_percentage"] + "%" : ""}
                                    </Card.Text>
                                    <Card.Text>
                                    Daily Increase: {budgetLoaded ? "$"+userBudget["daily_increase"] : ""}
                                    </Card.Text>
                                    <Button active variant="primary" onClick = {(() => setEditingBudget(true))}>Edit budget</Button>
                                    <Button style = {{marginLeft: "2%"}} onClick = {handleShowDeleteBudget} active variant="danger">Delete budget</Button>
                                </Card.Body>
                                <Card.Footer className="text-muted">Last Updated: 16/11/2001</Card.Footer>
                            </Card>
                        :    
                            <Card style = {{marginLeft: "8%", marginRight: "8%", marginTop: "5%"}} className="text-center">
                                <Card.Header><h3>Budget:</h3></Card.Header>
                                <Card.Body style = {{marginRight: "20%", marginLeft: "20%"}}>
                                    <InputGroup size="sm" className="mb-3">
                                        <InputGroup.Text  id="inputGroup-sizing-sm">New User Amount ($)</InputGroup.Text>
                                        <FormControl name = "user_amount" value = {updateBudgetState["user_amount"]} onChange = {handleUpdateBudgetInput} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
                                    </InputGroup>
                                    <InputGroup size="sm" className="mb-3">
                                        <InputGroup.Text  id="inputGroup-sizing-sm">New Daily Increase ($)</InputGroup.Text>
                                        <FormControl name = "daily_increase" value = {updateBudgetState["daily_increase"]} onChange = {handleUpdateBudgetInput} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
                                    </InputGroup>
                                    <InputGroup size="sm" className="mb-3">
                                        <InputGroup.Text  id="inputGroup-sizing-sm">New Save Percentage (%)</InputGroup.Text>
                                        <FormControl name = "save_percentage" value = {updateBudgetState["save_percentage"]} onChange = {handleUpdateBudgetInput} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
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
                        {expensesLoaded
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
                                        {shortenedExpenses.map((expense, i) => 
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
                                            <Button key = {i} name={expense["ID"]} variant="danger" type="submit" size="xs" active onClick = {handleShowDeleteExpense}>
                                                Delete
                                            </Button>
                                            </td>
                                            
                                        </tr>)}
                                </tbody>
                            </Table>
                            <Button href = "\expenses" variant = "info">
                                See All Expenses
                            </Button>
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