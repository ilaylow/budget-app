import axios from "axios";
import { API } from "../api";
import { getWithExpiry } from "./helperToken";

export function getUserBudget(userID, token){
    // We get the user budget from server
    // Use Axios
    console.log(token);
    console.log(userID);
    let config = {
        headers: {
          user_id: userID,
          token: token,
        }
      }

    return API.get("/budget", config)

}

export function getUserExpenses(userID, token){
    // We get the user budget from server
    // Use Axios
    console.log(token);
    console.log(userID);
    let config = {
        headers: {
          user_id: userID,
          token: token,
        }
      }

    return API.get("/expenses", config)

}