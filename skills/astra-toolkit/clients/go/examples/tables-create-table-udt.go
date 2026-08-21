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
			{Name: "id", Column: table.UUID()},
			{Name: "group_leader", Column: table.UDT("person")},
			{
				Name:   "group_members",
				Column: table.Set(table.UDT("person")),
			},
			{
				Name:   "group_roles",
				Column: table.Map("text", table.UDT("person")),
			},
		},
		PrimaryKey: table.PrimaryKey{
			PartitionBy: []string{"id"},
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
