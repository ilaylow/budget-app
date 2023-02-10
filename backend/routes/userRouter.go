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
	incomingRoutes.GET("/budget", controller.GetBudget())
	incomingRoutes.POST("/create_budget", controller.CreateBudget())
	incomingRoutes.PATCH("/update_budget", controller.UpdateBudget())
	incomingRoutes.DELETE("/delete_budget/:budget_id", controller.DeleteBudget())

	//incomingRoutes.GET("/users", controller.GetUsers())
	incomingRoutes.GET("/users/:user_id", controller.GetUser())
	incomingRoutes.DELETE("/users/delete/:user_id", controller.DeleteUser())

	incomingRoutes.GET("/expenses", controller.GetExpenses())
	incomingRoutes.POST("/create_expense", controller.CreateExpense())
	incomingRoutes.DELETE("/delete_expense/:expense_id", controller.DeleteExpense())

}
