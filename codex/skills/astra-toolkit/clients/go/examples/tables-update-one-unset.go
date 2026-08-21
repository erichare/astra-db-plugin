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
		update.Table().Unset("genres"),
	)
	if err != nil {
		log.Fatal(err)
	}
}
