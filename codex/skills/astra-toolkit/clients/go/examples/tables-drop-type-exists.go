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

	// Drop a user-defined type
	err := database.DropType(
		ctx,
		"**UDT_NAME**",
		options.DropType().SetIfExists(true),
	)
	if err != nil {
		log.Fatal(err)
	}
}
