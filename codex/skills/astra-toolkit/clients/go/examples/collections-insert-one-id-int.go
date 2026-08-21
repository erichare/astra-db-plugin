package main

import (
	"context"
	"log"

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

	// Insert a document into the collection
	_, err := collection.InsertOne(
		ctx,
		map[string]any{
			"_id":  1,
			"name": "Jane Doe",
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
