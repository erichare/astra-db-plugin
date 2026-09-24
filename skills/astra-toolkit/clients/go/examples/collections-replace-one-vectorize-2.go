package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
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

	// Replace a document
	result, err := collection.ReplaceOne(
		ctx,
		filter.Eq("_id", "101"),
		map[string]any{
			"name":       "Jane Doe",
			"$vectorize": "Text to vectorize",
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)
}
