import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.results.CollectionInsertOneResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import java.util.List;
import java.util.Map;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Insert a document into the collection
    Document document =
        new Document()
            .append("title", "Hidden Shadows of the Past")
            .append("genres", List.of("Biography", "Graphic Novel", "Dystopian", "Drama"))
            .append(
                "metadata",
                Map.of(
                    "isbn", "978-1-905585-40-3",
                    "language", "French",
                    "edition", "Anniversary Edition"));
    CollectionInsertOneResult result = collection.insertOne(document);
    System.out.println(result.getInsertedId());
  }
}
