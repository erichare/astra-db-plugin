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
	ctx := context.Background()

	// Get an existing collection
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	collection := database.Collection("**COLLECTION_NAME**")

	// Find documents
	cursor := collection.Find(
		filter.And(
			filter.Eq("areas.r&&d", false),
			filter.Lt("costs.price&.usd", 300),
		),
		options.CollectionFind().
			SetSort(sort.Asc("costs.price&.usd")).
			SetProjection(map[string]any{
				"areas.r&&d":       true,
				"costs.price&.cad": true,
			}),
	)

	// Iterate over the found documents
	for cursor.Next(ctx) {
		var document astra.Document
		if err := cursor.Decode(&document); err != nil {
			log.Fatal(err)
		}
		fmt.Println(document.ToMap())
	}
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

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
	ctx := context.Background()

	// Get an existing collection
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	collection := database.Collection("**COLLECTION_NAME**")

	// Find documents
	cursor := collection.Find(
		filter.And(
			filter.Eq(astra.EscapeFieldNames("areas", "r&d"), false),
			filter.Lt(astra.EscapeFieldNames("costs", "price.usd"), 300),
		),
		options.CollectionFind().
			SetSort(sort.Asc(astra.EscapeFieldNames("costs", "price.usd"))).
			SetProjection(map[string]any{
				astra.EscapeFieldNames("areas", "r&d"):       true,
				astra.EscapeFieldNames("costs", "price.cad"): true,
			}),
	)

	// Iterate over the found documents
	for cursor.Next(ctx) {
		var document astra.Document
		if err := cursor.Decode(&document); err != nil {
			log.Fatal(err)
		}
		fmt.Println(document.ToMap())
	}
}
