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
			// This update includes non-string keys,
			// so the update is a key-value pair represented as a slice
			Push("map_column_int_str", []any{1, "value1"}).
			// This update does not include non-string keys,
			// so the update can be a key-value pair represented as a
			// slice or a map
			Push("map_column_str_str", map[string]any{"key1": "value1"}).
			// When using $each, use a slice of key-value pairs for
			// non-string keys
			PushEach("map_column_int_str_2", []any{1, "value1"}, []any{2, "value2"}).

			// When using $each, use a slice of key-value pairs or maps
			// for string keys
			PushEach("map_column_str_str_2", map[string]any{"key1": "value1"}, []any{"key2", "value2"}),
	)
	if err != nil {
		log.Fatal(err)
	}
}
