package main

import (
	"context"
	"log"
	"time"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()
	// Get an existing collection
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	collection := database.Collection("**COLLECTION_NAME**")

	// Insert documents into the collection
	_, err := collection.InsertMany(
		ctx,
		[]map[string]any{
			{
				"name": "Jane Doe",
				"age":  42,
			},
			{
				"nickname": "Bobby",
				"color":    "blue",
				"foods":    []string{"carrots", "chocolate"},
			},
		},
		options.CollectionInsertMany().
			SetChunkSize(2).
			SetConcurrency(2).
			SetOrdered(false).
			UpdateAPIOptions(options.API().SetRequestTimeout(3*time.Second)),
	)
	if err != nil {
		log.Fatal(err)
	}
}
