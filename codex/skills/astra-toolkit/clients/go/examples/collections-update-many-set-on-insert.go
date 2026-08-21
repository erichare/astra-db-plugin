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

	// Update documents
	result, err := collection.UpdateMany(
		ctx,
		filter.And(
			filter.Eq("is_checked_out", false),
			filter.Lt("number_of_pages", 300),
		),
		update.Coll().
			Set("color", "blue").
			SetOnInsert("customer.name", "James"),
		options.CollectionUpdateMany().SetUpsert(true),
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)
}
