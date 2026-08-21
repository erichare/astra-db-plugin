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
	var result astra.Document
	err := collection.FindOneAndUpdate(
		ctx,
		filter.And(
			filter.Eq("is_checked_out", false),
			filter.Lt("number_of_pages", 3),
		),
		update.Coll().Set("color", "blue"),
		options.CollectionFindOneAndUpdate().SetUpsert(true),
	).
		Decode(&result)
	if err != nil {
		log.Print(err)
	}

	fmt.Println(result)
}
