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
				"name":     "Jane Doe",
				"$vector":  []float32{0.08, -0.62, 0.39},
				"$lexical": "An author who writes SciFi and fantasy novels.",
			},
			{
				"name":       "Mary Day",
				"$vectorize": "An athlete who loves biking, hiking, running, and swimming in the outdoors",
				"$lexical":   "She shares her love of triathlons by coaching kids after school.",
			},
			{
				"name":    "Bobby",
				"$hybrid": "A software developer who enjoys managing databases",
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
