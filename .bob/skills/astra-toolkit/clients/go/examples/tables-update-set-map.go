package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/update"
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

	// Update a row
	err := table.UpdateOne(
		ctx,
		filter.And(
			filter.Eq("title", "Hidden Shadows of the Past"),
			filter.Eq("author", "John Anthony"),
		),
		update.Table().
			// This map has non-string keys,
			// so the update is a slice of key-value pairs
			Set("map_column_int_str", [][]any{{1, "value1"}, {2, "value2"}}).

			// This map does not have non-string keys,
			// so the update does not need to be a slice of key-value
			// pairs
			Set("map_column_str_str", map[string]any{"key1": "value1", "key2": "value2"}),
	)
	if err != nil {
		log.Fatal(err)
	}
}
