using System.Security.Cryptography;
using System.Text;
using DataStax.AstraDB.DataApi;
using DataStax.AstraDB.DataApi.Collections;
using DataStax.AstraDB.DataApi.Core.Commands;

public class Program
{
  static async Task Main()
  {
    // Get an existing collection
    var client = new DataAPIClient();
    var database = client.GetDatabase(
      "**API_ENDPOINT**",
      "**APPLICATION_TOKEN**"
    );
    var collection = database.GetCollection("**COLLECTION_NAME**");

    // Example document
    var document = new Document()
    {
      ["title"] = "Example article",
      ["content"] =
        "This is the main text of the document. _id is generated from this field so that this field is never duplicated across documents.",
      ["source"] = "https://example.com",
    };

    // Derive a deterministic _id based on the "content" field
    string content = (string)document["content"]!;
    string id = Convert
      .ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(content)))
      .ToLower();
    document["_id"] = id;

    try
    {
      var result = await collection.InsertOneAsync(document);
      Console.WriteLine(
        $"Inserted new document with _id: {result.InsertedId}"
      );
    }
    catch (CommandException exception)
    {
      var isDuplicate =
        exception.Errors?.Any(e =>
          e.ErrorCode?.Equals(
            "DOCUMENT_ALREADY_EXISTS",
            StringComparison.OrdinalIgnoreCase
          ) == true
        ) ?? false;

      if (isDuplicate)
      {
        Console.WriteLine(
          "Document already exists with this _id; skipping insert."
        );
      }
      else
      {
        // Re-throw for any other error
        throw;
      }
    }
  }
}
