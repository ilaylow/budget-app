package helper

import (
	"errors"

	"github.com/gin-gonic/gin"
)

// Authentication Helper functions used to help authenticate user credentials handled in userController

func CheckUserType(c *gin.Context, role string) (err error) {
	userType := c.GetString("user_type")
	err = nil
	if userType != role {
		err = errors.New("unauthorized access to this resource")
		return err
	}

	return err
}

func MatchUserTypeToUid(c *gin.Context, userID string) (err error) {
	userType := c.GetString("user_type")
	uid := c.GetString("uid")

	err = nil

	if userType == "USER" && uid != userID {
		err = errors.New("unauthorized access to this resource")
		return err
	}

	err = CheckUserType(c, userType)
	return err
}
