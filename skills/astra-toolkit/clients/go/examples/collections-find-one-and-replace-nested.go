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
	var result astra.Document
	err := collection.FindOneAndReplace(
		ctx,
		filter.Eq("metadata.language", "English"),
		map[string]any{
			"title":           "Hidden Shadows of the Past",
			"number_of_pages": 481,
			"genres": []string{
				"Biography",
				"Graphic Novel",
				"Dystopian",
				"Drama",
			},
			"metadata": map[string]any{
				"isbn":     "978-1-905585-40-3",
				"language": "French",
				"edition":  "Anniversary Edition",
			},
		},
	).
		Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
}
