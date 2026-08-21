package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
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

	// Insert documents into the collection
	_, err := collection.InsertMany(
		ctx,
		[]map[string]any{
			{
				"name":    "Jane Doe",
				"age":     42,
				"$vector": []float32{0.08, -0.62, 0.39},
			},
			{
				"nickname": "Bobby",
				"$vector":  []float32{0.12, 0.53, 0.32},
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
