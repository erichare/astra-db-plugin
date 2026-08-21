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
			{Name: "title", Column: table.Text()},
			{Name: "number_of_pages", Column: table.Int()},
			{Name: "rating", Column: table.Float()},
			{Name: "genres", Column: table.Set(table.Text())},
			{Name: "metadata", Column: table.Map("text", table.Text())},
			{Name: "is_checked_out", Column: table.Boolean()},
			{Name: "due_date", Column: table.Date()},
		},
		PrimaryKey: table.PrimaryKey{
			PartitionBy: []string{"title"},
		},
	}

	// Create the table
	_, err := database.CreateTable(
		ctx,
		"**TABLE_NAME**",
		definition,
		options.CreateTable().SetKeyspace("**KEYSPACE_NAME**"),
	)
	if err != nil {
		log.Fatal(err)
	}
}
