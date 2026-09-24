package main

import (
	"context"
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
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

	// Create a text index
	err := table.CreateTextIndex(
		ctx,
		"**INDEX_NAME**",
		"**TEXT_COLUMN_NAME**",
		options.CreateTextIndex().UpdateAnalyzer("english"),
	)
	if err != nil {
		log.Fatal(err)
	}
}
