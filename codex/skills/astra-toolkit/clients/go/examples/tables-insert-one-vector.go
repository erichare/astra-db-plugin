package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/datatypes"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()
	// Get an existing table
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	table := database.Table("**TABLE_NAME**")

	// Insert a row into the table
	_, err := table.InsertOne(
		ctx,
		map[string]any{
			"title":  "Computed Wilderness",
			"author": "Ryan Eau",
			"summary_genres_vector": datatypes.NewVector(
				[]float32{0.08, -0.62, 0.39},
			),
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
