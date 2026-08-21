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
				"title": "Hidden Shadows of the Past",
				"genres": []string{
					"Biography",
					"Graphic Novel",
					"Dystopian",
					"Drama",
				},
				"metadata": map[string]any{
					"isbn":     "978-1-905585-40-3",
					"language": "French",
					"edition":  "Anniversary Edition",
				},
			},
			{
				"title": "Bake a Dozen",
				"genres": []string{
					"Biography",
					"Fiction",
				},
				"metadata": map[string]any{
					"isbn":     "342-2-875587-50-2",
					"language": "English",
					"edition":  "Illustrated Edition",
				},
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
