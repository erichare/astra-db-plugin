package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/table"
)

func main() {
	ctx := context.Background()

	// Get an existing table
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	tbl := database.Table("**TABLE_NAME**")

	// Add columns
		err := tbl.Alter(ctx, table.AddColumns{
		Columns: table.Columns{
			// This column will store vector embeddings.
			// The Azure OpenAI integration
			// will automatically generate vector embeddings
			// for any text inserted to this column.
			{
				Name: "**VECTOR_COLUMN_NAME**",
				Column: table.VectorWithService(1024, &table.VectorService{
					Provider:  "nvidia",
					ModelName: "nvidia/nv-embedqa-e5-v5",
				}),
			},
			// If you want to store the original text
			// in addition to the generated embeddings
			// you must create a separate column.
			{Name: "**TEXT_COLUMN_NAME**", Column: table.Text()},
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
