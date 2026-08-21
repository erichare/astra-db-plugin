package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log"

	"github.com/datastax/astra-db-go/v2/astra"
	"github.com/datastax/astra-db-go/v2/astra/options"
	"github.com/datastax/astra-db-go/v2/astra/results"
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

	// Example document
	document := map[string]any{
		"title":   "Example article",
		"content": "This is the main text of the document. _id is generated from this field so that this field is never duplicated across documents.",
		"source":  "https://example.com",
	}

	// Derive a deterministic _id based on the "content" field
	content := document["content"].(string)
	hash := sha256.Sum256([]byte(content))
	document["_id"] = hex.EncodeToString(hash[:])

	// Try to insert the document
	result, err := collection.InsertOne(ctx, document)
	if err != nil {
		// Check for DOCUMENT_ALREADY_EXISTS error
		var apiErrs *results.DataAPIErrors
		if errors.As(err, &apiErrs) {
			for _, apiErr := range *apiErrs {
				if apiErr.ErrorCode == "DOCUMENT_ALREADY_EXISTS" {
					fmt.Println(
						"Document already exists with this _id; skipping insert.",
					)
					return
				}
			}
		}
		// Handle all other errors
		log.Fatalf("Failed to insert document: %v", err)
	}

	insertedID, err := result.RawID()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Inserted new document with _id: %v\n", insertedID)
}
