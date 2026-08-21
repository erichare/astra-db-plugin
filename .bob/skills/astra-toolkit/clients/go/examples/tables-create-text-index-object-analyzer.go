package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()

	// Get an existing table
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	table := database.Table("**TABLE_NAME**")

	// Create a text index
	err := table.CreateTextIndex(
		ctx,
		"**INDEX_NAME**",
		"**TEXT_COLUMN_NAME**",
		options.CreateTextIndex().SetCustomAnalyzer(map[string]any{
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
		}),
	)
	if err != nil {
		log.Fatal(err)
	}
}
