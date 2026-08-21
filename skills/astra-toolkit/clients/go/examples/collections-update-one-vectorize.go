package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/sort"
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
		nil,
		update.Coll().Set("color", "blue"),
		options.CollectionUpdateOne().
			SetSort(sort.Vectorize("Text to vectorize")),
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)
}
