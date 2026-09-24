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

	// Drop an index
	err := database.DropTableIndex(
		ctx,
		"**INDEX_NAME**",
	)
	if err != nil {
		log.Fatal(err)
	}
}
