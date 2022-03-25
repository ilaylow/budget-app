package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Expense struct {
	ID           primitive.ObjectID `bson:"_id"`
	Expense_ID   string             `json:"expense_id"`
	User_ID      string             `json:"user_id"`
	Name         string             `json:"name" validate:"required,min=2,max=100"`
	Cost         float32            `json:"cost" validate:"required,min=0"`
	Date_Created time.Time          `json:"date_created"`
	Date         string             `json:"expense_date"`
}
