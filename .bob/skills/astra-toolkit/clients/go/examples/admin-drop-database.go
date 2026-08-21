package main

import (
	"context"
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

	err = admin.DropDatabase(ctx, "**DATABASE_ID**")

	if err != nil {
		log.Fatal(err)
	}
}
