package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/sort"
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
		filter.Eq("is_checked_out", false),
		options.TableFind().
			SetSort(sort.Asc("rating").Desc("title")).
			SetSkip(5),
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
