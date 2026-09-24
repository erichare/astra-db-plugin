package main

import (
	"context"
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/table"
)

func main() {
	ctx := context.Background()

	// Get an existing table
	client := astra.NewClient()

	database := client.Database(
		os.Getenv("ASTRA_DB_API_ENDPOINT"),
		options.API().SetToken(os.Getenv("ASTRA_DB_APPLICATION_TOKEN")),
	)

	tbl := database.Table("**TABLE_NAME**")

	// Add columns
	err := tbl.Alter(ctx, table.AddVectorize{
		Columns: map[string]table.VectorService{
				"**VECTOR_COLUMN_NAME**": {
					Provider:  "azureOpenAI",
					ModelName: "**MODEL_NAME**",
					Authentication: map[string]string{
						"providerKey": "**API_KEY_NAME**",
					},
					Parameters: map[string]string{
						"resourceName": "**RESOURCE_NAME**",
						"deploymentId": "**DEPLOYMENT_ID**",
					},
				},
			},
		},
	)

	if err != nil {
		log.Fatal(err)
	}
}
