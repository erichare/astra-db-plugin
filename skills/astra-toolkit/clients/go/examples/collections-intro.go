package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/sort"
)

func main() {
	ctx := context.Background()

	// Instantiate the client
	client := astra.NewClient()

	// Connect to a database
	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// Get an existing collection
	collection := database.Collection("**COLLECTION_NAME**")

	// Use vector search and filters to find a document
	var result astra.Document
	err := collection.FindOne(
		ctx,
		filter.And(
			filter.Eq("is_checked_out", false),
			filter.Lt("number_of_pages", 300),
		),
		options.CollectionFindOne().
			SetSort(sort.Vectorize("A thrilling story set in a futuristic world")),
	).
		Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
}
