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

	// Index a column
	err := table.CreateIndex(
		ctx,
		"**INDEX_NAME**",
		"**COLUMN_NAME**",
	)
	if err != nil {
		log.Fatal(err)
	}
}
