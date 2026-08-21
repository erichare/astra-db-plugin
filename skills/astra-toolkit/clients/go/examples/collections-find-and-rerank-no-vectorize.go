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
	vectorQuery := []float32{0.08, -0.62, 0.39}
	lexicalQuery := "house hill grassy"

	cursor := collection.FindAndRerank(
		filter.F{},
		options.CollectionFindAndRerank().
			SetSort(sort.HybridBy(sort.HybridSort{
				Vector:  &vectorQuery,
				Lexical: &lexicalQuery,
			})).
			SetRerankQuery("A tree in the woods").
			SetRerankOn("$lexical"),
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
