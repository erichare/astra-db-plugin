import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    Document document1 =
        new Document()
            .append("name", "Jane Doe")
            .append("$vector", new float[] {0.08f, -0.62f, 0.39f})
            .append("$lexical", "An author who writes SciFi and fantasy novels.");
    Document document2 =
        new Document()
            .append("name", "Mary Day")
            .append(
                "$vectorize",
                "An athlete who loves biking, hiking, running, and swimming in the outdoors")
            .append("$lexical", "She shares her love of triathlons by coaching kids after school.");
    Document document3 =
        new Document()
            .append("name", "Bobby")
            .append("$hybrid", "A software developer who enjoys managing databases");

    collection.insertMany(document1, document2, document3);
  }
}
