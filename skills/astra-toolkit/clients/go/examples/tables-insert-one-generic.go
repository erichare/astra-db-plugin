package main

import (
	"context"
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/datatypes"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()
	// Get an existing table
	client := astra.NewClient()

	database := client.Database(
		os.Getenv("ASTRA_DB_API_ENDPOINT"),
		options.API().SetToken(os.Getenv("ASTRA_DB_APPLICATION_TOKEN")),
	)

	table := database.Table("**TABLE_NAME**")

	// Insert a row into the table
	_, err := table.InsertOne(
		ctx,
		map[string]any{
			"title":           "Computed Wilderness",
			"author":          "Ryan Eau",
			"number_of_pages": 432,
			"due_date": datatypes.DateOnly{
				Year:  2024,
				Month: 12,
				Day:   18},
			"genres": []string{"History", "Biography"},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
