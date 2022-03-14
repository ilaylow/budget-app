package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID       primitive.ObjectID `bson:"_id"`
	name     *string            `json:"name" validate:"required, min=2, max=100"`
	password *string            `json: "password" validate:"required min=6"`
}
