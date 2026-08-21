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

	client := astra.NewClient(
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	admin, err := client.Admin()

	if err != nil {
		log.Fatal(err)
	}

	databases, err := admin.ListDatabases(ctx)

	if err != nil {
		log.Fatal(err)
	}

	output, err := json.Marshal(databases)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(string(output))
}
