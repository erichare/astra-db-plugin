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
	ctx := context.Background()

	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	table := database.Table("**TABLE_NAME**")

	originalTextColumn := "**NAME_OF_ORIGINAL_TEXT_COLUMN**"
	newVectorColumn := "**NAME_OF_NEW_VECTOR_COLUMN**"

	// Use an empty filter to find all rows
	filterClause := filter.F{}

	// You must include ALL primary key columns for your table
	primaryKeyColumns := []string{
		"**PRIMARY_KEY_1**",
		"**PRIMARY_KEY_2**",
	}

	// The projection should include ALL primary key columns
	// and the column that stores the original text
	projection := map[string]any{
		originalTextColumn: true,
	}
	for _, column := range primaryKeyColumns {
		projection[column] = true
	}

	var pageState *string
	migratedCount := 0

	for {
		findOpts := options.TableFind().SetProjection(projection)
		if pageState != nil {
			findOpts = findOpts.SetInitialPageState(*pageState)
		}

		cursor := table.Find(filterClause, findOpts)
		cursor.Next(ctx)

		var rows []astra.Row
		if err := cursor.DecodeBuffered(&rows, 0); err != nil {
			log.Fatal(err)
		}

		if err := cursor.Err(); err != nil {
			log.Fatal(err)
		}

		pageState = cursor.NextPageState()

		if len(rows) == 0 {
			fmt.Println("No more rows. Migration complete.")
			break
		}

		// Build the updates
		updatedRows := make([]map[string]any, 0, len(rows))
		for _, row := range rows {
			originalText, ok := row.Get(originalTextColumn)

			if !ok || originalText == nil {
				continue
			}

			// Set the new vector column to the original text
			updatedRow := map[string]any{newVectorColumn: originalText}

			for _, column := range primaryKeyColumns {
				updatedRow[column] = row.MustGet(column)
			}

			updatedRows = append(updatedRows, updatedRow)
		}

		// Inserting a row with a primary key that already exists in the
		// table will overwrite the specified column but leave unspecified
		// columns unchanged.
		if _, err := table.InsertMany(ctx, updatedRows); err != nil {
			log.Fatal(err)
		}

		migratedCount += len(rows)

		fmt.Printf(
			"Migrated %d rows. Page state: %v\n",
			migratedCount,
			pageState,
		)

		if pageState == nil {
			fmt.Println("Reached final page. Migration complete.")
			break
		}
	}
}
