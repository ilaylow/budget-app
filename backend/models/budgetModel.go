package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Budget struct {
	ID            primitive.ObjectID `bson:"_id"`
	User_ID       string             `json:"user_id"`
	Monthly_limit float32            `json:"cost"`
	Date_Created  time.Time          `json:"date_created"`
	Save_Percent  int32              `json:"save_percentage"`
	User_Amount   float32            `json:"user_amount"`
}
