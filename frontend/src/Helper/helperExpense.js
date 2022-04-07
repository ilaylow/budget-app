const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function sortExpenses(userExpenses, accesor){
    userExpenses.sort(
        function(x, y){
            const dateSplitX = x[accesor].split("/")
            const dateSplitY = y[accesor].split("/")

            if (parseInt(dateSplitX[2]) == parseInt(dateSplitY[2])){
                if (parseInt(dateSplitX[1]) == parseInt(dateSplitY[1])){
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

    console.log(userExpenses)

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