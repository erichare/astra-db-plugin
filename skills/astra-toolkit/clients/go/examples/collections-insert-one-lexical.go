package main

import (
	"context"
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()
	// Get an existing collection
	client := astra.NewClient()

	database := client.Database(
		os.Getenv("ASTRA_DB_API_ENDPOINT"),
		options.API().SetToken(os.Getenv("ASTRA_DB_APPLICATION_TOKEN")),
	)

	collection := database.Collection("**COLLECTION_NAME**")

	// Insert a document into the collection
	_, err := collection.InsertOne(
		ctx,
		map[string]any{
			"name":     "Jane Doe",
			"$lexical": "An active hiker, runner, and triathlete who loves the outdoors.",
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
