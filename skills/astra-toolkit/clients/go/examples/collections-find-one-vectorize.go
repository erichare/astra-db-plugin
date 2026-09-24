package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
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

	// Find a document
	var result astra.Document
	err := collection.FindOne(
		ctx,
		nil,
		options.CollectionFindOne().
			SetSort(sort.Vectorize("Text to vectorize")),
	).
		Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
}
