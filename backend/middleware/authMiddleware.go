package middleware

import (
	helper "budget-app/backend/helpers"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Used to authenticate if valid user is currently logged in
func Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientToken := c.Request.Header.Get("token")
		if clientToken == "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("No Authorization Header Provided")})
			c.Abort()
			return

		}

		claims, errString := helper.ValidateToken(clientToken)
		if errString != "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": errString})
			c.Abort()
			return
		}

		c.Set("email", claims.Email)
		c.Set("name", claims.Name)
		c.Set("uid", claims.UID)
		c.Set("user_type", claims.User_Type)

		c.Next()
	}
}
