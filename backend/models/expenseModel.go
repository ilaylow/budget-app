package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Expense struct {
	ID         primitive.ObjectID `bson:"_id"`
	User_ID    string             `json:"user_id"`
	Expense_ID *string            `json:"expense_id"`
	Name       *string            `json:"name" validate:"required,min=2,max=100"`
	Cost       float32            `json:"cost" validate:"required,min=0"`
	Date       time.Time          `json:"expense_date"`
}
