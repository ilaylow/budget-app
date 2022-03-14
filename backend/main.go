package main

import (
	routes "budget-app/backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	port := "8080"

	router := gin.New()
	router.Use(gin.Logger())

	routes.AuthRoutes(router)
	routes.userRoutes(router)

	router.GET("/api-1", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"success": "Access granted api-1"})
	})

	router.RUN(":" + port)
}
