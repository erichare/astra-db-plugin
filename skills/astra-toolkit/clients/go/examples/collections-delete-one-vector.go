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

	// Delete a document
	result, err := collection.DeleteOne(
		ctx,
		filter.F{},
		options.CollectionDeleteOne().
			SetSort(sort.Vector([]float32{0.08, -0.62, 0.39})),
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)
}
