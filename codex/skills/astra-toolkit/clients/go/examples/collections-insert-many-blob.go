package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
)

func main() {
	ctx := context.Background()
	// Get an existing collection
	client := astra.NewClient()

	database := client.Database(
		"**API_ENDPOINT**",
		options.API().SetToken("**APPLICATION_TOKEN**"),
	)

	collection := database.Collection("**COLLECTION_NAME**")

	// Insert documents with binary fields
	_, err := collection.InsertMany(
		ctx,
		[]map[string]any{
			{
				// Using $binary with a base64-encoded string
				"exampleBinary": map[string]any{
					"$binary": "PfvnbT7peNU/Sfvn",
				},
				// No need for explicit '$binary' with a byte array
				"anotherExampleBinary": []byte{
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
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
