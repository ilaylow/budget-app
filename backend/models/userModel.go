package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID            primitive.ObjectID `bson:"_id"`
	User_ID       string             `json:"user_id"`
	User_Type     *string            `json:"user_type" validate:"required,eq=ADMIN|eq=USER"`
	Name          *string            `json:"name" validate:"required,min=2,max=100"`
	Email         *string            `json:"email" validate:"email,required"`
	Password      *string            `json:"password" validate:"required,min=6"`
	Token         *string            `json:"token"`
	Refresh_Token *string            `json:"refresh_token"`
}
