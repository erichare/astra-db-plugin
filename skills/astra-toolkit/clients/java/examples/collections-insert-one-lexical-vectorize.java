import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient(System.getenv("ASTRA_DB_APPLICATION_TOKEN"))
            .getDatabase(System.getenv("ASTRA_DB_API_ENDPOINT"))
            .getCollection("**COLLECTION_NAME**");

    Document document =
        new Document()
            .append("name", "Jane Doe")
            .append(
                "$vectorize",
                "An athlete who loves biking, hiking, running, and swimming in the outdoors")
            .append("$lexical", "She shares her love of triathlons by coaching kids after school");

    collection.insertOne(document);
  }
}
