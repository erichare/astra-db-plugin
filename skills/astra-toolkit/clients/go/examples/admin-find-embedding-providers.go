package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()

	client := astra.NewClient(
		options.API().SetToken(os.Getenv("ASTRA_DB_APPLICATION_TOKEN")),
	)

	admin, err := client.Admin()

	dbAdmin := admin.DatabaseAdminFromEndpoint(os.Getenv("ASTRA_DB_API_ENDPOINT"))

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
