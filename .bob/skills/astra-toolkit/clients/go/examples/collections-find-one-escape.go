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

	// Find a document
	var result astra.Document
	err := collection.FindOne(
		ctx,
		filter.And(
			filter.Eq("areas.r&&d", false),
			filter.Lt("costs.price&.usd", 300),
		),
		options.CollectionFindOne().
			SetSort(sort.Asc("costs.price&.usd")).
			SetProjection(map[string]any{
				"areas.r&&d":       true,
				"costs.price&.cad": true,
			}),
	).Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
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

	// Find a document
	var result astra.Document
	err := collection.FindOne(
		ctx,
		filter.And(
			filter.Eq(astra.EscapeFieldNames("areas", "r&d"), false),
			filter.Lt(astra.EscapeFieldNames("costs", "price.usd"), 300),
		),
		options.CollectionFindOne().
			SetSort(sort.Asc(astra.EscapeFieldNames("costs", "price.usd"))).
			SetProjection(map[string]any{
				astra.EscapeFieldNames("areas", "r&d"):       true,
				astra.EscapeFieldNames("costs", "price.cad"): true,
			})).
		Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
}
