package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/update"
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

	// Update a document
	var result astra.Document
	err := collection.FindOneAndUpdate(
		ctx,
		filter.And(
			filter.Eq("areas.r&&d", false),
			filter.Lt("costs.price&.usd", 300),
		),
		update.Coll().
			Set("areas.r&&d", true).
			Set("costs.price&.usd", 310),
	).
		Decode(&result)
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
	"github.com/datastax/astra-db-go/v2/astra/update"
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

	// Update a document
	var result astra.Document
	err := collection.FindOneAndUpdate(
		ctx,
		filter.And(
			filter.Eq(astra.EscapeFieldNames("areas", "r&d"), false),
			filter.Lt(astra.EscapeFieldNames("costs", "price.usd"), 300),
		),
		update.Coll().
			Set(astra.EscapeFieldNames("areas", "r&d"), true).
			Set(astra.EscapeFieldNames("costs", "price.usd"), 310),
	).
		Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result.ToMap())
}
