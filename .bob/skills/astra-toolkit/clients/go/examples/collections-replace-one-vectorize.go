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

	// Get an existing collection
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	collection := database.Collection("**COLLECTION_NAME**")

	// Replace a document
	result, err := collection.ReplaceOne(
		ctx,
		filter.F{},
		map[string]any{
			"name": "Jane Doe",
			"age":  42,
		},
		options.CollectionReplaceOne().
			SetSort(sort.Vectorize("Text to vectorize")),
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)
}
