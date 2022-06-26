import axios from "axios";
import { getWithExpiry } from "./helperToken";

export const signIn = (formData) => API.post('/users/login', formData);
export const signUp = (formData) => API.post('/users/signup', formData);

const API = axios.create({baseURL: "https://budget-app-pugo5p3mta-ts.a.run.app"})

export function createUserBudget(body, token){
    
    body["user_amount"] = parseFloat(body["user_amount"])
    body["daily_increase"] = parseFloat(body["daily_increase"])
    body["save_percentage"] = parseInt(body["save_percentage"])

    console.log(body)

    let config = {
        headers: {
          token: token,
        }
      }

    return API.post("/create_budget", body, config)

}

export function getUserBudget(userID, token){

    let config = {
        headers: {
          user_id: userID,
          token: token,
        }
      }

    return API.get("/budget", config)

}

export function deleteUserBudget(budgetID, token){
    let config = {
        headers: {
          token: token,
        }
    }
    
    return API.delete(`/delete_budget/${budgetID}`, config)
}

export function updateUserBudget(body, token){

    body["user_amount"] = parseFloat(body["user_amount"])
    body["daily_increase"] = parseFloat(body["daily_increase"])
    body["save_percentage"] = parseInt(body["save_percentage"])

    let config = {
        headers: {
          token: token,
        }
    }
    
    return API.patch("/update_budget", body, config)
}

export function createUserExpense(body, token){

    body["cost"] = parseFloat(body["cost"])

    let config = {
        headers: {
          token: token,
        }
      }

    return API.post("/create_expense", body, config)

}

export function getUserExpenses(userID, token){

    let config = {
        headers: {
          user_id: userID,
          token: token,
        }
      }

    return API.get("/expenses", config)

}

export function deleteUserExpense(expenseID, token){

    let config = {
        headers: {
          token: token,
        }
      }

    return API.delete(`/delete_expense/${expenseID}`, config)

}

export function updateUserPassword(email, password, updated_password){
  
  const body = {
    "email": email,
    "initial_password": password,
    "updated_password": updated_password
  }

  return API.post("/update_password", body, null);
  
}

