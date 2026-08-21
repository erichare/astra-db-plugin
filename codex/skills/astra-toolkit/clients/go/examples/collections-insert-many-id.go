package main

import (
	"context"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/datatypes"
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

	// Insert documents into the collection
	uuid := datatypes.NewUUIDv7()

	objId, err := datatypes.ParseObjectId("6672e1cbd7fabb4e5493916f")
	if err != nil {
		log.Fatal(err)
	}

	_, err = collection.InsertMany(
		ctx,
		[]map[string]any{
			{
				"name": "Melissa",
				"_id":  objId,
			},
			{
				"name": "Jess",
				"_id":  uuid,
			},
			{
				"name": "Jane",
				"_id":  1,
			},
			{
				"name": "Bobby",
				"_id":  "b_023",
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}
}
