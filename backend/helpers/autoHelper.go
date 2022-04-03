package helper

import (
	"budget-app/backend/database"
	"budget-app/backend/models"
	"context"
	"log"
	"strconv"

	"github.com/jasonlvhit/gocron"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var budgetCollection *mongo.Collection = database.OpenCollection(database.Client, "budget")

func IncreaseUserAmountEachDay() {
	gocron.Every(1).Day().Do(UpdateUserAmount)
	<-gocron.Start()
}

func UpdateUserAmount() {
	// Get all the users from the database
	log.Println("Updating user amounts now...")
	//Define an array in which you can store the decoded documents
	var countUpdated = 0

	//Passing the bson.D{{}} as the filter matches all documents in the collection
	cur, err := userCollection.Find(context.TODO(), bson.D{{}})
	if err != nil {
		log.Fatal(err)
	}
	//Finding multiple documents returns a cursor
	//Iterate through the cursor allows us to decode documents one at a time

	for cur.Next(context.TODO()) {
		//Create a value into which the single document can be decoded
		var user models.User
		err := cur.Decode(&user)
		if err != nil {
			log.Fatal(err)
			return
		}

		// Use the user_id to update the budgets belonging to the users
		var budget models.Budget
		errBudget := budgetCollection.FindOne(context.Background(), bson.M{"user_id": user.User_ID}).Decode(&budget)
		if errBudget != nil {
			log.Fatal(errBudget)
		}

		newAmountLeft := budget.User_Amount + budget.Daily_Increase

		_, errUpdate := budgetCollection.UpdateOne(context.Background(),
			bson.M{"user_id": user.User_ID},
			bson.D{primitive.E{Key: "$set", Value: bson.M{
				"user_amount": newAmountLeft}}})
		if errUpdate != nil {
			log.Fatal(errUpdate.Error())
			return
		}

		countUpdated++

	}

	log.Println("Updated Documents: " + strconv.Itoa(countUpdated))
}
