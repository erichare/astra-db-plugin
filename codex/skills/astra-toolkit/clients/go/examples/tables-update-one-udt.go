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
		filter.Eq("title", "Chemistry Club"),
		update.Table().Set("president", map[string]any{
			"email":     "lisa@example.com",
			"user_name": "lisa_m"}).Set("vice_president", map[string]any{
			"email":     "tanya@example.com",
			"user_name": "tanya_o"}),
	)
	if err != nil {
		log.Fatal(err)
	}
}
