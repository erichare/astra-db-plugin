import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.results.CollectionInsertOneResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.exceptions.DataAPIResponseException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public class Example {

  public static void main(String[] args) throws NoSuchAlgorithmException {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Example document fields
    String content =
        "This is the main text of the document. _id is generated from this field so that this field is never duplicated across documents.";
    String title = "Example article";
    String source = "https://example.com";

    // Derive a deterministic _id based on the "content" field
    String id =
        HexFormat.of()
            .formatHex(
                MessageDigest.getInstance("SHA-256")
                    .digest(content.getBytes(StandardCharsets.UTF_8)));

    Document document =
        new Document()
            .id(id)
            .append("title", title)
            .append("content", content)
            .append("source", source);

    try {
      CollectionInsertOneResult result = collection.insertOne(document);
      System.out.println("Inserted new document with _id: " + result.getInsertedId());
    } catch (DataAPIResponseException error) {
      // Check for DOCUMENT_ALREADY_EXISTS from the Data API error code
      String errorCode = error.getErrorCode();
      if ("DOCUMENT_ALREADY_EXISTS".equals(errorCode)) {
        System.out.println("Document already exists with this _id; skipping insert.");
      } else {
        // Re-throw for any other Data API error
        throw error;
      }
    }
  }
}
