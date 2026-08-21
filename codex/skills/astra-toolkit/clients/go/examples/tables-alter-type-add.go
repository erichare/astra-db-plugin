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

	// Add fields to a user-defined type
	err := database.AlterType(ctx, "member", table.AddTypeFields{
		Fields: table.Columns{
			{Name: "email", Column: table.Text()},
			{Name: "credits", Column: table.Int()},
		}})
	if err != nil {
		log.Fatal(err)
	}
}
