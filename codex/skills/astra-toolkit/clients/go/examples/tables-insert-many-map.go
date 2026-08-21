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
				// This map has non-string keys,
				// so the insertion is an array of key-value pairs
				"map_column_int_str": [][]any{
					{1, "value1"},
					{2, "value2"},
				},
				// This map does not have non-string keys,
				// so the insertion does not need to be an array of
				// key-value pairs
				"map_column_str_str": map[string]any{
					"key1": "value1",
					"key2": "value2",
				},
				"title":  "Once in a Living Memory",
				"author": "Kayla McMaster",
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
