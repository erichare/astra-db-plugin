package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/cursors"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/sort"
)

func main() {
	ctx := context.Background()

	// Get an existing collection
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	collection := database.Collection("**COLLECTION_NAME**")

	// Find documents
	vectorizeQuery := "A tree in the woods"
	lexicalQuery := "house hill grassy"

	cursor := collection.FindAndRerank(
		filter.F{},
		options.CollectionFindAndRerank().
			SetSort(sort.HybridBy(sort.HybridSort{
				Vectorize: &vectorizeQuery,
				Lexical:   &lexicalQuery,
			})),
	)

	// Iterate over the found documents
	for cursor.Next(ctx) {
		var result cursors.RerankedResult[astra.Document]
		if err := cursor.Decode(&result); err != nil {
			log.Fatal(err)
		}
		fmt.Println(result.Document.ToMap())
	}
}
