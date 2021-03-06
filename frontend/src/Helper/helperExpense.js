export const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const getDays = (year, month) => {
    return new Date(year, month, 0).getDate();
};

export function getTotalSavedFromExpenses(sortedUserExpenses, dailyIncrease, month, year){
    // Get the most recent date
    const today = new Date().getDate();
    const currMonth = new Date().getMonth();
    const currYear = new Date().getFullYear();

    let numDaysPassed = 0;
    if ((monthNames.indexOf(month) === currMonth && year == currYear) || (month == -1 && year == -1)){
        numDaysPassed = today;
    } else{
        numDaysPassed = getDays(year, monthNames.indexOf(month) + 1)
    }
    
    const totalEarned = numDaysPassed * dailyIncrease;

    let totalSum = 0;
    sortedUserExpenses.forEach(x => {
        totalSum += x["cost"];
    })

    const totalSaved = (totalEarned - totalSum).toFixed(2);

    return totalSaved;
}

export function sortExpenses(userExpenses, accesor){
    userExpenses.sort(
        function(x, y){
            const dateSplitX = x[accesor].split("/")
            const dateSplitY = y[accesor].split("/")

            if (parseInt(dateSplitX[2]) === parseInt(dateSplitY[2])){
                if (parseInt(dateSplitX[1]) === parseInt(dateSplitY[1])){
                    const dayX = parseInt(dateSplitX[0])
                    const dayY = parseInt(dateSplitY[0])
    
                    return dayY - dayX;
                }
                else{
                    return parseInt(dateSplitY[1]) - parseInt(dateSplitX[1])
                }
            }

            return parseInt(dateSplitY[2]) - parseInt(dateSplitX[2])
            
        }
    )

    
    return userExpenses;
}

export function processUserExpenses(userExpenses){
    // Separate them into Years, then into months

    // Make a map where each key is a new year

    let expenseYears = {}

    userExpenses.forEach((expense) => {
        let date = expense["expense_date"]
        let dateSplit = date.split("/");

        let year = dateSplit[2];
        let monthNum = dateSplit[1];

        let monthName = monthNames[parseInt(monthNum) - 1]
        let name = expense["name"]
        let cost = expense["cost"]
        let ID = expense["ID"]


        if (year in expenseYears){
            if (monthName in expenseYears[year]){
                expenseYears[year][monthName].push({"ID": ID, "name": name, "cost": cost, "date": date})
            }
            else{
                expenseYears[year][monthName] = [{"ID": ID, "name": name, "cost": cost, "date": date}]
            }
        }
        else{
            expenseYears[year] = {}
            expenseYears[year][monthName] = [{"ID": ID, "name": name, "cost": cost, "date": date}]
        }

        
    });

    return expenseYears
}