package routes

import (
	controller "budget-app/backend/controllers"
	middleware "budget-app/backend/middleware"

	"github.com/gin-gonic/gin"
)

// User routing directs requests to appropriate user controllers
// Uses authentication middleware to authenticate users before handling any user specific requests
func UserRoutes(incomingRoutes *gin.Engine) {
	incomingRoutes.Use(middleware.Authenticate())
	incomingRoutes.GET("/users", controller.GetUsers())
	incomingRoutes.GET("/users/:user_id", controller.GetUser())
}
