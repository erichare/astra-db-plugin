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

	// Find a document
	var result astra.Document
	err := collection.FindOne(
		ctx,
		filter.And(
			filter.Eq("is_checked_out", false),
			filter.Lt("number_of_pages", 300),
		),
		options.CollectionFindOne().
			SetSort(sort.Asc("rating").Desc("title")).
			SetProjection(map[string]any{"is_checked_out": true, "title": true}),
	).
		Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
}
