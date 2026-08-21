package main

import (
	"context"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()

	client := astra.NewClient(
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	admin, err := client.Admin()

	dbAdmin := admin.DatabaseAdminFromEndpoint("**API_ENDPOINT**")

	result, err := dbAdmin.FindEmbeddingProviders(ctx)

	if err != nil {
		log.Fatal(err)
	}

	for name, provider := range result.EmbeddingProviders {
		fmt.Printf("Provider: %s (%s)\n", name, provider.DisplayName)
		for _, model := range provider.Models {
			fmt.Printf("  Model: %s\n", model.Name)
		}
	}
}
