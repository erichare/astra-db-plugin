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

	// Get a database
	client := astra.NewClient()

	database := client.Database(
		os.Getenv("ASTRA_DB_API_ENDPOINT"),
		options.API().SetToken(os.Getenv("ASTRA_DB_APPLICATION_TOKEN")),
	)

	// Drop a table
	err := database.DropTable(
		ctx,
		"**TABLE_NAME**",
		options.DropTable().SetIfExists(true),
	)
	if err != nil {
		log.Fatal(err)
	}
}
