package main

import (
	"context"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()

	// Instantiate the client
	client := astra.NewClient()

	// Connect to a database
	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// Create a collection
	database.CreateCollection(
		ctx,
		"**COLLECTION_NAME**",
		options.CreateCollection().
			UpdateVector(options.Vector().
				SetMetric(string(options.MetricCosine)).
				UpdateService(
					options.VectorService().
						SetProvider("nvidia").
						SetModelName("nvidia/nv-embedqa-e5-v5"),
				)),
	)
}
