package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Budget struct {
	ID              primitive.ObjectID `bson:"_id"`
	Budget_ID       string             `json:"budget_id"`
	User_ID         string             `json:"user_id"`
	Daily_Increase  float32            `json:"daily_increase"`
	Date_Created    time.Time          `json:"date_created"`
	Save_Percentage int32              `json:"save_percentage"`
	User_Amount     float32            `json:"user_amount"`
}
