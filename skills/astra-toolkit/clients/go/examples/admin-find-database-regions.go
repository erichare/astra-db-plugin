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

	regions, err := admin.FindAvailableRegions(ctx)

	if err != nil {
		log.Fatal(err)
	}

	output, err := json.Marshal(regions)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(string(output))
}
