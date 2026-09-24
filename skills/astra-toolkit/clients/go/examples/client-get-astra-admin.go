package main

import (
	"log"
	"os"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	client := astra.NewClient(
		options.API().SetToken(os.Getenv("ASTRA_DB_APPLICATION_TOKEN")),
	)

	_, err := client.Admin(options.API())

	if err != nil {
		log.Fatal(err)
	}
}
