import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.results.CollectionInsertOneResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import java.util.Map;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Insert a document with a binary field
    byte[] exampleBytes = {
      (byte) 0x3D, (byte) 0xFB, (byte) 0xE7, (byte) 0x6D,
      (byte) 0x3E, (byte) 0xE9, (byte) 0x78, (byte) 0xD5,
      (byte) 0x3F, (byte) 0x49, (byte) 0xFB, (byte) 0xE7
    };

    Document document = new Document().append("exampleBinary", Map.of("$binary", exampleBytes));

    CollectionInsertOneResult result = collection.insertOne(document);

    System.out.println(result.getInsertedId());
  }
}
