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

	if err != nil {
		log.Fatal(err)
	}

	databaseInfo, err := admin.DatabaseInfo(ctx, "**DATABASE_ID**")

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(databaseInfo)
}
