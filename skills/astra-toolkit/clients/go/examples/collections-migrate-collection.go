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

	oldCollection := database.Collection("**OLD_COLLECTION_NAME**")
	newCollection := database.Collection("**NEW_COLLECTION_NAME**")

	// Use an empty filter to migrate all documents
	filterClause := filter.F{}

	// You must explicitly include $vectorize.
	// $vector is excluded by default.
	// _id and any other fields that don't start with $ are included by
	// default.
	projection := map[string]any{
		"$vectorize": true,
	}

	var pageState *string
	migratedCount := 0

	for {
		findOpts := options.CollectionFind().SetProjection(projection)
		if pageState != nil {
			findOpts = findOpts.SetInitialPageState(*pageState)
		}

		cursor := oldCollection.Find(filterClause, findOpts)
		cursor.Next(ctx)

		var documents []astra.Document
		if err := cursor.DecodeBuffered(&documents, 0); err != nil {
			log.Fatal(err)
		}

		if err := cursor.Err(); err != nil {
			log.Fatal(err)
		}

		pageState = cursor.NextPageState()

		if len(documents) == 0 {
			fmt.Println("No more documents. Migration complete.")
			break
		}

		// Insert the documents to the new collection.
		// _id and the other field values (excluding $vector) will be the
		// same. $vector will automatically be generated based on the value
		// of $vectorize.
		_, err := newCollection.InsertMany(ctx, documents)
		if err != nil {
			log.Fatal(err)
		}

		migratedCount += len(documents)

		fmt.Printf(
			"Migrated %d documents. Page state: %v\n",
			migratedCount,
			pageState,
		)

		if pageState == nil {
			fmt.Println("Reached final page. Migration complete.")
			break
		}
	}
}
