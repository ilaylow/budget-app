package controllers

import (
	"budget-app/backend/database"
	helper "budget-app/backend/helpers"
	"budget-app/backend/models"
	"context"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "user")
var budgetCollection *mongo.Collection = database.OpenCollection(database.Client, "budget")
var expenseCollection *mongo.Collection = database.OpenCollection(database.Client, "expense")

var validate = validator.New()

func HashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Panic(err)
	}
	return string(bytes)
}

func VerifyPassword(userPassword string, foundUserPassword string) (bool, string) {
	err := bcrypt.CompareHashAndPassword([]byte(foundUserPassword), []byte(userPassword))
	check := true
	msg := ""

	if err != nil {
		msg = "Email or password is incorrect"
		check = false
	}

	return check, msg
}

// Function returns an object of type HandlerFunc (takes context as a parameter)
func SignUp() gin.HandlerFunc {

	return func(c *gin.Context) {
		// Creates a context object with a cancel func
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel() // Pushes the use of the cancel function to the end of this handler func

		var user models.User

		// Binds the context request JSON body to the USER struct
		// If passed an invalid body then return an error
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validates values that are passed in
		// validationErr will be nil if there are NO ERRORS
		if validationErr := validate.Struct(user); validationErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
		}

		// Recall that BSON is Binary JSON, MongoDB stores documents in a binary representation known as BSON
		// Allows for easy and flexible data processing
		password := HashPassword(*user.Password)
		user.Password = &password

		count, err := userCollection.CountDocuments(ctx, bson.M{"email": user.Email})
		if err != nil {
			log.Panic(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error whilst signing up..."})
		}

		// If there exists any other users with the same email, then return an error...
		if count > 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "This email already exists!"})
		}

		user.ID = primitive.NewObjectID()
		user.User_ID = user.ID.Hex()
		token, refreshToken, _ := helper.GenerateAllTokens(*user.Email, *user.Name, *user.User_Type, user.User_ID)
		user.Token = &token
		user.Refresh_Token = &refreshToken

		resultInsertionNumber, insertErr := userCollection.InsertOne(ctx, user)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "User item was not created"})
			return
		}

		defer cancel()
		c.JSON(http.StatusOK, resultInsertionNumber)
	}
}

func SignIn() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var user models.User
		var foundUser models.User

		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := userCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&foundUser)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Email or Password is incorrect"})
			return
		}

		passwordIsValid, msg := VerifyPassword(*user.Password, *foundUser.Password)

		if !passwordIsValid {
			c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
			return
		}

		if foundUser.Email == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		}
		token, refreshToken, _ := helper.GenerateAllTokens(*foundUser.Email, *foundUser.Name, *foundUser.User_Type, foundUser.User_ID)
		helper.UpdateAllTokens(token, refreshToken, foundUser.User_ID)
		err = userCollection.FindOne(ctx, bson.M{"user_id": foundUser.User_ID}).Decode(&foundUser)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, foundUser)
	}
}

func GetUsers() gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := helper.CheckUserType(c, "ADMIN"); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		recordPerPage, err := strconv.Atoi(c.Query("recordPerPage"))
		if err != nil || recordPerPage < 1 {
			recordPerPage = 10
		}
		page, err1 := strconv.Atoi(c.Query("page"))
		if err1 != nil || page < 1 {
			page = 1
		}

		startIndex, err2 := strconv.Atoi(c.Query("startIndex"))
		if err2 != nil {
			startIndex = (page - 1) * recordPerPage
		}

		matchStage := bson.D{primitive.E{Key: "$match", Value: bson.D{{}}}}
		groupStage := bson.D{primitive.E{Key: "$group", Value: bson.D{
			primitive.E{Key: "_id", Value: bson.D{primitive.E{Key: "_id", Value: "null"}}},
			primitive.E{Key: "total_count", Value: bson.D{primitive.E{Key: "$sum", Value: 1}}},
			primitive.E{Key: "data", Value: bson.D{primitive.E{Key: "$push", Value: "$$ROOT"}}},
		}}}

		projectStage := bson.D{
			primitive.E{Key: "$project", Value: bson.D{
				primitive.E{Key: "_id", Value: 0},
				primitive.E{Key: "total_count", Value: 1},
				primitive.E{Key: "user_items", Value: bson.D{primitive.E{Key: "$slice", Value: []interface{}{"$data", startIndex, recordPerPage}}}},
			}},
		}

		result, err := userCollection.Aggregate(ctx, mongo.Pipeline{
			matchStage, groupStage, projectStage,
		})

		defer cancel()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error occured while listing users..."})
		}

		var allUsers []bson.M
		if err = result.All(ctx, &allUsers); err != nil {
			log.Fatal(err)
		}

		c.JSON(http.StatusOK, allUsers[0])
	}
}

func GetUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.Param("user_id")

		if err := helper.MatchUserTypeToUid(c, userId); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}

		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var user models.User
		err := userCollection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&user)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, user)
	}
}

func DeleteUser() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userId := ctx.Param("user_id")

		ctx1, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		// Delete from User, Budget, and Expense Collection
		_, err := userCollection.DeleteOne(ctx1, bson.M{"user_id": userId})
		_, err1 := budgetCollection.DeleteOne(ctx1, bson.M{"user_id": userId})
		expensesCount, err2 := expenseCollection.DeleteOne(ctx1, bson.M{"user_id": userId})

		if err != nil || err1 != nil || err2 != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		ctx.JSON(http.StatusOK, gin.H{"expenses_deleted": expensesCount})
	}
}

func GetBudget() gin.HandlerFunc {
	return func(ctx *gin.Context) {

		// Obtain user id
		userId := ctx.Request.Header.Get("user_id")
		log.Println("UserID: " + userId)

		var ctx1, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var budget models.Budget
		err := budgetCollection.FindOne(ctx1, bson.M{"user_id": userId}).Decode(&budget)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "User has no budget plan created!"})
		}

		log.Println(budget)

		ctx.JSON(http.StatusOK, budget)
	}
}

func CreateBudget() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx1, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		// Bind request object to budget Object
		var createBudget models.Budget
		if err := ctx.BindJSON(&createBudget); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Validate Budget Struct
		if validationErr := validate.Struct(createBudget); validationErr != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Error()})
			return
		}

		userCount, err := userCollection.CountDocuments(ctx1, bson.M{"user_id": createBudget.User_ID})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if userCount == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "User doesn't exist!"})
			return
		}

		// Check now if user already has a budget, if so then throw error
		budgetCount, err := budgetCollection.CountDocuments(ctx1, bson.M{"user_id": createBudget.User_ID})
		log.Println(budgetCount)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if budgetCount != 0 {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "User already has a budget plan in place!"})
			return
		}

		// Define object to be created
		createBudget.ID = primitive.NewObjectID()
		createBudget.Budget_ID = createBudget.ID.Hex()
		createBudget.Date_Created = time.Now()

		resultInsertionNumber, insertErr := budgetCollection.InsertOne(ctx1, createBudget)
		if insertErr != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Budget item cannot be created!"})
			return
		}

		ctx.JSON(http.StatusOK, resultInsertionNumber)
	}
}

func UpdateBudget() gin.HandlerFunc {
	return func(ctx *gin.Context) {

		// Bind request object to budget Object
		var updatedBudget models.Budget
		if err := ctx.BindJSON(&updatedBudget); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx1, cancel := context.WithTimeout(context.Background(), time.Second*100)
		defer cancel()

		updatedResult, err := budgetCollection.UpdateOne(ctx1,
			bson.M{"user_id": updatedBudget.User_ID},
			bson.D{primitive.E{Key: "$set", Value: bson.M{
				"daily_increase":  updatedBudget.Daily_Increase,
				"save_percentage": updatedBudget.Save_Percentage,
				"user_amount":     updatedBudget.User_Amount}}})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		ctx.JSON(http.StatusOK, updatedResult)
	}
}

func DeleteBudget() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		budgetId := ctx.Param("budget_id")
		log.Println(budgetId)

		ctx1, cancel := context.WithTimeout(context.Background(), time.Second*100)
		defer cancel()

		deleteResult, err := budgetCollection.DeleteOne(ctx1, bson.M{"budget_id": budgetId})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Budget can't be deleted!"})
			return
		}

		ctx.JSON(http.StatusOK, deleteResult)
	}
}

func GetExpenses() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Obtain user id
		userId := ctx.Request.Header.Get("user_id")

		ctx1, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		// Get expense through userID
		cursor, err := expenseCollection.Find(ctx1, bson.M{"user_id": userId})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// From: https://stackoverflow.com/questions/54876209/find-all-documents-in-a-collection-with-mongo-go-driver
		var expenses []models.Expense
		for cursor.Next(ctx1) {
			var elem models.Expense
			err := cursor.Decode(&elem)
			if err != nil {
				log.Fatal(err)
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			expenses = append(expenses, elem)
		}

		if err := cursor.Err(); err != nil {
			log.Fatal(err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		cursor.Close(ctx1)

		ctx.JSON(http.StatusOK, gin.H{"expenses": expenses})

	}
}

func CreateExpense() gin.HandlerFunc {
	return func(ctx *gin.Context) {

		ctx1, cancel := context.WithTimeout(context.Background(), time.Second*100)
		defer cancel()

		// Bind ctx to JSON
		var createExpense models.Expense
		if err := ctx.BindJSON(&createExpense); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if user even exists
		userCount, err := userCollection.CountDocuments(ctx1, bson.M{"user_id": createExpense.User_ID})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if userCount == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "User doesn't exist!"})
			return
		}

		// Define object to be created
		createExpense.ID = primitive.NewObjectID()
		createExpense.Expense_ID = createExpense.ID.Hex()
		createExpense.Date_Created = time.Now()

		resultInsertionNumber, insertErr := expenseCollection.InsertOne(ctx1, createExpense)
		if insertErr != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Expense item cannot be created!"})
			return
		}

		// Need to make amendments to user budget after insertion

		updatedResult, err := helper.UpdateBudgetAmountAfterExpense(createExpense, true)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
		}

		ctx.JSON(http.StatusOK, gin.H{"insertExpenseNumber": resultInsertionNumber, "updateBudgetNumber": updatedResult})

	}
}

func DeleteExpense() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		expenseId := ctx.Param("expense_id")

		ctx1, cancel := context.WithTimeout(context.Background(), time.Second*100)
		defer cancel()

		var findExpense models.Expense
		err := expenseCollection.FindOne(ctx1, bson.M{"expense_id": expenseId}).Decode(&findExpense)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Expense can't be found!"})
			return
		}

		deleteResult, err := expenseCollection.DeleteOne(ctx1, bson.M{"expense_id": expenseId})
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Expense can't be deleted!"})
			return
		}

		// Update user budget now
		updatedResult, err := helper.UpdateBudgetAmountAfterExpense(findExpense, false)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"Error": err.Error()})
		}

		ctx.JSON(http.StatusOK, gin.H{"deleteResult": deleteResult, "updatedResult": updatedResult})
	}
}
