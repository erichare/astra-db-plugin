package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/table"
)

func main() {
	ctx := context.Background()

	// Get a database
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// Create a user-defined type
	definition := table.UDTDefinition{
		Fields: table.Columns{
			{Name: "name", Column: table.Text()},
			{Name: "is_active", Column: table.Boolean()},
			{Name: "date_joined", Column: table.Date()},
		},
	}
	err := database.CreateType(
		ctx,
		"member",
		definition,
		options.CreateType().SetIfNotExists(true),
	)
	if err != nil {
		log.Fatal(err)
	}
}
