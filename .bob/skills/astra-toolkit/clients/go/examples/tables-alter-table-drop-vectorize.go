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
	err := tbl.Alter(ctx, table.DropVectorize{
		Columns: []string{"plot_synopsis"},
	})

	if err != nil {
		log.Fatal(err)
	}
}
