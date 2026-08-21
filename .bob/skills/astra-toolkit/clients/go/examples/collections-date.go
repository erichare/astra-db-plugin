package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/filter"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/update"
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

	// Use dates in insertions
	_, err := collection.InsertMany(
		ctx,
		[]map[string]any{
			{
				"registered_at": time.Date(
					2026,
					time.July,
					6,
					12,
					0,
					0,
					0,
					time.UTC,
				),
			},
			{
				"registered_at": map[string]any{"$date": 1690045891},
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	// Use dates in a filter
	var result map[string]any
	err = collection.FindOne(
		ctx,
		filter.Or(
			filter.Gt(
				"registered_at",
				time.Date(2026, time.March, 6, 12, 0, 0, 0, time.UTC),
			),
			filter.Eq(
				"registered_at",
				map[string]any{"$date": 1690045891},
			),
		),
	).
		Decode(&result)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(result)

	// Use the $currentDate update operator and use dates in the $set
	// operator
	_, err = collection.UpdateOne(
		ctx,
		filter.Eq(
			"registered_at",
			time.Date(2026, time.July, 6, 12, 0, 0, 0, time.UTC),
		),
		update.Coll().
			CurrentDate("maintenance_a_date").
			Set("maintenance_b_date", map[string]any{"$date": 1690045891}).
			Set("maintenance_c_date", time.Date(2026, time.July, 6, 12, 0, 0, 0, time.UTC)),
	)
	if err != nil {
		log.Fatal(err)
	}
}
