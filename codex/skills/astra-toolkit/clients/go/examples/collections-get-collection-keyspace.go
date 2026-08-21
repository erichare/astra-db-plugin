package main

import (
	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	// Get a database
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// Get a collection
	database.Collection(
		"**COLLECTION_NAME**",
		options.GetCollection().SetKeyspace("**KEYSPACE_NAME**"),
	)
}
