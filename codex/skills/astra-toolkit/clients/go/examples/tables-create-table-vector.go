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

	// Get an existing database
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// Define the columns and primary key for the table
	definition := table.Definition{
		Columns: table.Columns{
			{Name: "example_vector", Column: table.Vector(1024)},
			{Name: "example_non_vector", Column: table.Text()},
		},
		PrimaryKey: table.PrimaryKey{
			PartitionBy: []string{"example_non_vector"},
		},
	}

	// Create the table
	_, err := database.CreateTable(
		ctx,
		"**TABLE_NAME**",
		definition,
	)
	if err != nil {
		log.Fatal(err)
	}
}
