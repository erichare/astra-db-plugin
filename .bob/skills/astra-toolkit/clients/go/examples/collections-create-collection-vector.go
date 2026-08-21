package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()

	// Get an existing database
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// Create a collection
	_, err := database.CreateCollection(
		ctx,
		"**COLLECTION_NAME**",
		options.CreateCollection().
			UpdateVector(options.Vector().
				SetDimension(1024).
				SetMetric(string(options.MetricCosine)).
				SetSourceModel("nv-qa-4")),
	)
	if err != nil {
		log.Fatal(err)
	}
}
