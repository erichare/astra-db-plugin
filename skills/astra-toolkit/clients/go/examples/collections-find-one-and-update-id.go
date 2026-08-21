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
		filter.Eq("_id", "101"),
		update.Coll().Set("color", "blue"),
	).
		Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
}
