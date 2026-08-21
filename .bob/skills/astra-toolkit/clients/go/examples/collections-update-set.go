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
			filter.Eq("title", "Into Shadows of Tomorrow"),
			filter.Eq("author", "Nicole Wright"),
		),
		update.Coll().Set("number_of_pages", 423).Set("rating", 4.5),
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)
}
