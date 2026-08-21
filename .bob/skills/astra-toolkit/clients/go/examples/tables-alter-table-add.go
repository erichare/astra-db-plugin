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

	// Get an existing table
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	tbl := database.Table("**TABLE_NAME**")

	// Add columns
	err := tbl.Alter(ctx, table.AddColumns{
		Columns: table.Columns{
			{Name: "is_summer_reading", Column: table.Boolean()},
			{Name: "library_branch", Column: table.Text()},
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
