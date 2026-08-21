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
				UpdateService(
					options.VectorService().
						SetProvider("nvidia").
						SetModelName("nvidia/nv-embedqa-e5-v5"))).
			UpdateLexical(options.Lexical().
				SetEnabled(true).
				SetCustomAnalyzer(map[string]any{
					"tokenizer": map[string]any{
						"name": "standard",
						"args": map[string]any{},
					},
					"filters": []map[string]any{
						{"name": "lowercase"},
						{"name": "stop"},
						{"name": "porterstem"},
						{"name": "asciifolding"},
					},
					"charFilters": []map[string]any{},
				})).
			UpdateRerank(options.Rerank().
				SetEnabled(true).
				UpdateService(
					options.RerankService().
						SetProvider("nvidia").
						SetModelName("nvidia/llama-3.2-nv-rerankqa-1b-v2"),
				)),
	)
	if err != nil {
		log.Fatal(err)
	}
}
