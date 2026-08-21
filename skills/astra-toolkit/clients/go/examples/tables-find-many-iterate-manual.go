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

	// Create the filter
	filterClause := filter.And(
		filter.Eq("is_checked_out", false),
		filter.Lt("number_of_pages", 300),
	)

	// Get the first page
	cursor1 := table.Find(
		filterClause,
	)

	cursor1.Next(ctx)

	var results1 []astra.Row
	if err := cursor1.DecodeBuffered(&results1, 0); err != nil {
		log.Fatal(err)
	}
	for _, row := range results1 {
		fmt.Println(row.ToMap())
	}

	if err := cursor1.Err(); err != nil {
		log.Fatal(err)
	}

	paginationState1 := cursor1.NextPageState()

	// Get the next page
	if paginationState1 != nil {
		cursor2 := table.Find(
			filterClause,
			options.TableFind().
				SetInitialPageState(*paginationState1),
		)

		cursor2.Next(ctx)

		var results2 []astra.Row
		if err := cursor2.DecodeBuffered(&results2, 0); err != nil {
			log.Fatal(err)
		}
		for _, row := range results2 {
			fmt.Println(row.ToMap())
		}

		if err := cursor2.Err(); err != nil {
			log.Fatal(err)
		}

		paginationState2 := cursor2.NextPageState()
		_ = paginationState2 // Can be used for further pagination
	}
}
