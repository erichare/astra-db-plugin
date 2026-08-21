import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.results.CollectionInsertManyResult;
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

    // Insert documents into the collection
    Document document1 =
        new Document()
            .append("title", "Hidden Shadows of the Past")
            .append("genres", List.of("Biography", "Graphic Novel", "Dystopian", "Drama"))
            .append(
                "metadata",
                Map.of(
                    "isbn", "978-1-905585-40-3",
                    "language", "French",
                    "edition", "Anniversary Edition"));
    Document document2 =
        new Document()
            .append("title", "Bake a Dozen")
            .append("genres", List.of("Biography", "Fiction"))
            .append(
                "metadata",
                Map.of(
                    "isbn", "342-2-875587-50-2",
                    "language", "English",
                    "edition", "Illustrated Edition"));
    CollectionInsertManyResult result = collection.insertMany(List.of(document1, document2));
    System.out.println("IDs inserted: " + result.getInsertedIds());
  }
}
