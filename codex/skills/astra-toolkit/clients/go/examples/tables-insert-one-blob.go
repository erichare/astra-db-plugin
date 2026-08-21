package main

import (
	"context"
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

	// Insert binary values
	_, err := table.InsertOne(
		ctx,
		map[string]any{
			// Using $binary with a Base64-encoded string
			"example_blob": map[string]any{
				"$binary": "PfvnbT7peNU/Sfvn",
			},
			// No need for explicit '$binary' with a byte array
			"another_example_blob": []byte{
				0x3d,
				0xfb,
				0xe7,
				0x6d,
				0x3e,
				0xe9,
				0x78,
				0xd5,
				0x3f,
				0x49,
				0xfb,
				0xe7,
			},
			"title": "Example",
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
