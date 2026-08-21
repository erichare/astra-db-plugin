package main

import (
	"context"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/table"
)

func main() {
	ctx := context.Background()

	// Instantiate the client
	client := astra.NewClient()

	// Connect to a database
	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	// Define the columns and primary key for the table
	definition := table.Definition{
		Columns: table.Columns{
			// This column will store vector embeddings.
			// The configured vector service
			// will automatically generate vector embeddings
			// for any text inserted to this column.
			{
				Name: "**VECTOR_COLUMN_NAME**",
				Column: table.VectorWithService(**MODEL_DIMENSIONS**, &table.VectorService{
					Provider:  "huggingfaceDedicated",
					ModelName: "**MODEL_NAME**",
					Authentication: map[string]string{
						"providerKey": "**API_KEY_NAME**",
					},
					Parameters: map[string]string{
						"endpointName": "**ENDPOINT_NAME**",
						"regionName": "**REGION**",
						"cloudName": "**CLOUD_PROVIDER**",
					},
				}),
			},
			// If you want to store the original text
			// in addition to the generated embeddings
			// you must create a separate column.
			{Name: "**TEXT_COLUMN_NAME**", Column: table.Text()},
		},
		// You should change the primary key definition to meet the needs
		// of your data.
		PrimaryKey: table.PrimaryKey{
			PartitionBy: []string{"**TEXT_COLUMN_NAME**"},
		},
	}

	// Create the table
	database.CreateTable(
		ctx,
		"**TABLE_NAME**",
		definition,
	)
}
