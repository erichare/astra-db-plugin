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

	// Insert rows into the table
	_, err := table.InsertMany(
		ctx,
		[]map[string]any{
			{
				"title":                        "Computed Wilderness",
				"author":                       "Ryan Eau",
				"summary_genres_vector":        "Text to vectorize",
				"summary_genres_original_text": "Text to vectorize",
			},
			{
				"title":                        "Desert Peace",
				"author":                       "Walter Dray",
				"summary_genres_vector":        "Text to vectorize",
				"summary_genres_original_text": "Text to vectorize",
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
