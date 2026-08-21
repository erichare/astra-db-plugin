package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
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
		filter.Eq("_id", "101"),
		map[string]any{
			"name":    "Jane Doe",
			"$vector": []float32{0.08, -0.62, 0.39},
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)
}
