package main

import (
	routes "budget-app/backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	port := "8080"

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(cors.Default())

	routes.AuthRoutes(router)
	routes.UserRoutes(router)

	router.GET("/api-1", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"success": "Access granted api-1"})
	})

	router.Run(":" + port)
}
