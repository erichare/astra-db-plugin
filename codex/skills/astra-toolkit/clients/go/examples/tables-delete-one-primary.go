package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
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

	// Delete a row
	err := table.DeleteOne(
		ctx,
		filter.And(
			filter.Eq("title", "Hidden Shadows of the Past"),
			filter.Eq("author", "John Anthony"),
		),
	)
	if err != nil {
		log.Fatal(err)
	}
}
