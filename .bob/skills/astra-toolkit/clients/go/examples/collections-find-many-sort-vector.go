package main

import (
	"context"
	"fmt"

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

	// Find documents
	cursor := collection.Find(
		filter.F{},
		options.CollectionFind().
			SetSort(sort.Vectorize("Text to vectorize")).SetIncludeSortVector(true),
	)

	// Get the sort vector from the result
	vector := cursor.GetSortVector(ctx)
	fmt.Println(vector)
}
