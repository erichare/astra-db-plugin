package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()

	// Get an existing database
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// Create a collection
	_, err := database.CreateCollection(
		ctx,
		"**COLLECTION_NAME**",
		options.CreateCollection().
			UpdateLexical(options.Lexical().
				SetEnabled(true).
				SetCustomAnalyzer(map[string]any{
					"tokenizer": map[string]any{
						"name": "standard",
						"args": map[string]any{},
					},
					"filters": []map[string]any{
						{"name": "lowercase"},
						{"name": "stop"},
						{"name": "porterstem"},
						{"name": "asciifolding"},
					},
					"charFilters": []map[string]any{},
				})),
	)
	if err != nil {
		log.Fatal(err)
	}
}
