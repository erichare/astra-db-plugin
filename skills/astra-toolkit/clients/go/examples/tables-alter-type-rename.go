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

	// Rename fields in a user-defined type
	err := database.AlterType(ctx, "member", table.RenameTypeFields{
		Fields: map[string]string{
			"name": "first_name", "is_active": "is_member",
		}})
	if err != nil {
		log.Fatal(err)
	}
}
