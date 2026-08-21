package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/update"
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

	// Update a document
	result, err := collection.UpdateOne(
		ctx,
		filter.And(
			filter.Eq("title", "Name of the Mountain"),
			filter.Eq("author", "Gina Marlin"),
		),
		update.Coll().
			SetOnInsert("rating", 5.0).
			SetOnInsert("is_checked_out", false),
		options.CollectionUpdateOne().SetUpsert(true),
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)
}
