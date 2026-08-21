package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()

	// Get a database
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// Drop a table
	err := database.DropTable(ctx, "**TABLE_NAME**")
	if err != nil {
		log.Fatal(err)
	}
}
