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

	// Use a projection
	var result astra.Document
	err := collection.FindOne(
		ctx,
		filter.Eq("metadata.language", "English"),
		options.CollectionFindOne().SetProjection(map[string]any{
			"genres": map[string]any{
				"$slice": []any{4, 2},
			},
			"title": true,
		}),
	).Decode(&result)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
}
