package controllers

import (
	"budget-app/backend/database"
	helper "budget-app/backend/helpers"
	"budget-app/backend/models"
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

var userCollection *mongo.Collection = database.OpenCollection(database.Client, "user")
var validate = validator.New()

func HashPassword()

func VerifyPassword()

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
		count, err := userCollection.CountDocuments(ctx, bson.M{"email": user.Email})
		if err != nil {
			log.Panic(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error whilst signing up..."})
		}

		// If there exists any other users with the same email, then return an error...
		if count > 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "This email already exists!"})
		}
	}
}

func SignIn()

func GetUsers()

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
