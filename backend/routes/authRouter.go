package routes

import (
	controller "budget-app/backend/controllers"

	"github.com/gin-gonic/gin"
)

// Authentication Route handler, directs requests to the appropriate controller functions
func AuthRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.POST("users/signup", controller.SignUp())
	incomingRoutes.POST("users/login", controller.SignIn())
}
