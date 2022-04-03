package helper

import (
	"budget-app/backend/models"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func UpdateBudgetAmountAfterExpense(expense models.Expense, minusExpense bool) (*mongo.UpdateResult, error) {
	ctx1, cancel := context.WithTimeout(context.Background(), time.Second*100)
	defer cancel()

	var budget models.Budget
	errBudget := budgetCollection.FindOne(ctx1, bson.M{"user_id": expense.User_ID}).Decode(&budget)
	if errBudget != nil {
		return nil, errBudget
	}

	var newAmountLeft float32
	if minusExpense {
		newAmountLeft = budget.User_Amount - expense.Cost
	} else {
		newAmountLeft = budget.User_Amount + expense.Cost
	}

	updatedResult, errUpdate := budgetCollection.UpdateOne(ctx1,
		bson.M{"user_id": expense.User_ID},
		bson.D{primitive.E{Key: "$set", Value: bson.M{
			"user_amount": newAmountLeft}}})
	if errUpdate != nil {
		return nil, errBudget
	}

	return updatedResult, errBudget
}
