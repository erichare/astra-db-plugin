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

	// Index a the values of a map column
	err := table.CreateIndex(
		ctx,
		"**INDEX_NAME**",
		map[string]string{"**MAP_COLUMN_NAME**": "$values"},
	)
	if err != nil {
		log.Fatal(err)
	}
}
