package main

import (
	"context"
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()

	// Get an existing table
	client := astra.NewClient()

	database := client.Database(
		os.Getenv("ASTRA_DB_API_ENDPOINT"),
		options.API().SetToken(os.Getenv("ASTRA_DB_APPLICATION_TOKEN")),
	)

	table := database.Table("**TABLE_NAME**")

	// Delete all rows
	err := table.DeleteMany(
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
