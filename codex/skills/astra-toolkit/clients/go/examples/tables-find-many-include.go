package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	// Get an existing table
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	table := database.Table("**TABLE_NAME**")

	ctx := context.Background()

	// Find rows
	cursor := table.Find(
		filter.Lt("number_of_pages", 300),
		options.TableFind().
			SetProjection(map[string]any{
				"is_checked_out": true,
				"title":          true,
			}),
	)

	// Iterate over the found rows
	for cursor.Next(ctx) {
		var row astra.Row
		if err := cursor.Decode(&row); err != nil {
			log.Fatal(err)
		}
		fmt.Println(row.ToMap())
	}
}
