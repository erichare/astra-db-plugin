package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/sort"
)

func main() {
	ctx := context.Background()

	// Get an existing collection
	client := astra.NewClient()

	database := client.Database(
		os.Getenv("ASTRA_DB_API_ENDPOINT"),
		options.API().SetToken(os.Getenv("ASTRA_DB_APPLICATION_TOKEN")),
	)

	collection := database.Collection("**COLLECTION_NAME**")

	// Replace a document
	result, err := collection.ReplaceOne(
		ctx,
		filter.Eq("metadata.language", "English"),
		map[string]any{
			"is_checked_out":  false,
			"number_of_pages": 400,
		},
		options.CollectionReplaceOne().
			SetSort(sort.Asc("rating").Desc("title")),
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)
}
