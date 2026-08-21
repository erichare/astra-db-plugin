package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
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

	// List index metadata
	indexes, err := table.ListIndexes(ctx)

	if err != nil {
		log.Fatal(err)
	}

	output, err := json.Marshal(indexes)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(output))
}
