import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Table } from "react-bootstrap";
import { Navigate } from "react-router";
import { processUserExpenses, sortExpenses } from "../../Helper/helperExpense";
import { getWithExpiry } from "../../Helper/helperToken";
import { deleteUserExpense, getUserExpenses } from "../../Helper/helperUser";

let userExpenses = []
let separatedExpenses = {}

export const Expenses = () => {
    const isLoggedIn = getWithExpiry("token");
    const [yearlyExpenses, setYearlyExpenses] = useState({});
    const [monthlyExpenses, setMonthlyExpenses] = useState({});
    const [yearSelected, setYearSelected] = useState(0);
    const [monthSelected, setMonthSelected] = useState(0);
    const [currentExpenses, setCurrentExpenses] = useState([]);

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
        console.log(event.target.name)
        
        let currMonthExpenses = separatedExpenses[yearSelected][event.target.name];
        currMonthExpenses = sortExpenses(currMonthExpenses, "date");
        setCurrentExpenses(currMonthExpenses);
    }

    useEffect(async () => {
        const userId = getWithExpiry("user_ID");

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
    }, [])

    return (
        <div>
            <Button href = "/home" style = {{marginLeft: "7%", marginTop: "5%"}} size="lg" active variant ="danger">Back</Button>
            {isLoggedIn
            ? <div style = {{marginLeft: "13%", marginTop: "6%"}}>
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
                    ?   <Table responsive="lg" >
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
                                        <Button key = {i} name={expense["ID"]} variant="danger" type="submit" size="xs" active onClick = {handleDelete}>
                                            Delete
                                        </Button>
                                        </td>
                                        
                                    </tr>)}
                            </tbody>
                        </Table>
                    :   <></>
                    }
                </div>

                
              </div>
            : <Navigate to="/login" />}
        </div>
    )
}