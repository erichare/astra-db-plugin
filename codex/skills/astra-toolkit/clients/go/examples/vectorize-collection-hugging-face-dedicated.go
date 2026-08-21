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
				SetDimension(**MODEL_DIMENSIONS**).
				SetMetric("**SIMILARITY_METRIC**").
				UpdateService(
					options.VectorService().
						SetProvider("huggingfaceDedicated").
						SetModelName("**MODEL_NAME**").
						SetAuthentication(
							map[string]any{"providerKey": "**API_KEY_NAME**"}
						).
						SetParameters(map[string]any{
							"endpointName": "**ENDPOINT_NAME**",
							"regionName": "**REGION**",
							"cloudName": "**CLOUD_PROVIDER**"
						}),
				)),
	)
}
