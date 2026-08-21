package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()

	// Get a database
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// List collections
	collections, err := database.ListCollections(ctx)
	if err != nil {
		log.Fatal(err)
	}

	output, err := json.Marshal(collections)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(output))
}
