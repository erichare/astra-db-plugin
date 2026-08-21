package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
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

	// Replace a document
	var result astra.Document
	err := collection.FindOneAndReplace(
		ctx,
		filter.Eq("_id", "101"),
		map[string]any{
			"name":       "Jane Doe",
			"$vectorize": "Text to vectorize",
		},
	).
		Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
}
