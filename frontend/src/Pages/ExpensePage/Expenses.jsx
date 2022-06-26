import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Table } from "react-bootstrap";
import { Navigate } from "react-router";
import { ConfirmationModal } from "../../Components/ConfirmationModal";
import { processUserExpenses, sortExpenses, getTotalSavedFromExpenses, getDays, monthNames} from "../../Helper/helperExpense";
import { getWithExpiry } from "../../Helper/helperToken";
import { deleteUserExpense, getUserBudget, getUserExpenses } from "../../Helper/helperUser";

let userExpenses = []
let userBudget = null;
let separatedExpenses = {}

let expenseName = null;

export const Expenses = () => {
    const isLoggedIn = getWithExpiry("token");
    const [yearlyExpenses, setYearlyExpenses] = useState({});
    const [monthlyExpenses, setMonthlyExpenses] = useState({});
    const [yearSelected, setYearSelected] = useState(0);
    const [monthSelected, setMonthSelected] = useState(0);
    const [currentExpenses, setCurrentExpenses] = useState([]);
    const [currentTotalSaved, setCurrentTotalSaved] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleShowDeleteExpense = (event) => {
        setShowConfirmation(true);
        expenseName = event.target.name;
    }

    const handleDelete = (event) => {

        deleteUserExpense(event.target.name, isLoggedIn).then((res) => {
            window.location.reload(false);

            // Reload page
        }).catch((err) => {
            console.log(err);
        });
    }

    const handleSelectYear = (event) => {
        event.preventDefault();
        setYearSelected(parseInt(event.target.name));
        const newMonthlyExpenses = Object.keys(separatedExpenses[event.target.name])
        newMonthlyExpenses.reverse();
        setMonthlyExpenses(newMonthlyExpenses);
    }

    const handleSelectMonth = (event) => {
        event.preventDefault();
        setMonthSelected(event.target.name) 
        
        let currMonthExpenses = separatedExpenses[yearSelected][event.target.name];
        currMonthExpenses = sortExpenses(currMonthExpenses, "date");
        const totalSaved = getTotalSavedFromExpenses(currMonthExpenses, userBudget["daily_increase"], event.target.name, yearSelected)
        setCurrentTotalSaved(totalSaved);
        setCurrentExpenses(currMonthExpenses);
    }
 
    const setMoneySavedColor = () => {
        let daysToUse, date = new Date(), monthSelectedIndex = monthNames.indexOf(monthSelected);
        if (date.getMonth() === monthSelectedIndex){
            daysToUse = date.getDate();
        } else{
            daysToUse = getDays(yearSelected, monthSelectedIndex)
        }

        const threshold = userBudget["daily_increase"] * daysToUse * userBudget["save_percentage"] * 0.01;
        const threshold10Above = userBudget["daily_increase"] * daysToUse * ((userBudget["save_percentage"] * 0.01) + 0.1);

        console.log(threshold);
        console.log(threshold10Above);
        console.log(daysToUse);
        if (currentTotalSaved === 0){
            return "black";
        }

        if (currentTotalSaved <  threshold){
            return "red"
        }

        if (currentTotalSaved >= threshold && currentTotalSaved <= threshold10Above){
            return "orange"
        }

        return "green";
    }

    useEffect(() => {
        const userId = getWithExpiry("user_ID");

        async function getUserData(){
            getUserBudget(userId, isLoggedIn).then((res) => {
                userBudget = res.data;

                getUserExpenses(userId, isLoggedIn).then((res) => {
                    userExpenses = res.data.expenses;
                    // Reverse the list of expenses here so we have the latest on the top
                    userExpenses.reverse();
        
                    separatedExpenses = processUserExpenses(userExpenses);
                    setYearlyExpenses(Object.keys(separatedExpenses));
                    
                     //console.log(userExpenses);
                     console.log(separatedExpenses);
                }).catch((err) => {
                    console.log(err);
                })
    
            }).catch((err) => {
                console.log(err.response);
            });
    
            
        }
        getUserData()
    }, [])

    return (
        <div>
            <ConfirmationModal show = {showConfirmation} handleClose = {() => setShowConfirmation(false)} deleteItem = {handleDelete} expenseName = {expenseName}/>
            <Button href = "/home" style = {{marginLeft: "7%", marginTop: "5%"}} size="lg" active variant ="danger">Back</Button>
            {isLoggedIn
            ? <div style = {{marginLeft: "13%", marginTop: "4%"}}>
                <ButtonGroup size="lg" className="mb-2">
                {
                    Object.keys(separatedExpenses).map((year, i) => {
                        return <Button name = {year} key = {i} onClick = {handleSelectYear}>{year}</Button>
                    })
                }
                </ButtonGroup>
                {
                    yearSelected
                ?   <ButtonGroup style = {{marginLeft: "5%"}} className="mb-2">
                        {
                            monthlyExpenses.map((month, i) => {
                                return <Button variant = "secondary" name = {month} key = {i} onClick = {handleSelectMonth}>{month}</Button>
                            })
                        }
                    </ButtonGroup>
                :   <></>}
                <div style = {{marginRight: "20%"}}>
                    {
                        monthSelected
                    ?   
                        <div>
                            <h3 style={{marginTop: "3%", color: setMoneySavedColor()}}>Amount Saved: ${currentTotalSaved}</h3>
                            <Table responsive="lg" >
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Cost</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                        {currentExpenses.map((expense, i) => 
                                        <tr key = {i}>
                                            <td>
                                                {expense["name"]}
                                            </td>
                                            <td>
                                                {expense["cost"]}
                                            </td>
                                            <td>
                                                {expense["date"]}
                                            </td>
                                            <td>
                                            <Button key = {i} name={expense["ID"]} variant="danger" type="submit" size="xs" active onClick = {handleShowDeleteExpense}>
                                                Delete
                                            </Button>
                                            </td>
                                            
                                        </tr>)}
                                </tbody>
                            </Table>
                        </div>
                    :   <></>
                    }
                </div>

                
              </div>
            : <Navigate to="/login" />}
        </div>
    )
}