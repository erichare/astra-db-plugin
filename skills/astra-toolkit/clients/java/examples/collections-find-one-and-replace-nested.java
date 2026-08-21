import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Replace a document
    Filter filter = Filters.eq("metadata.language", "English");
    Document newDocument =
        new Document()
            .append("title", "Hidden Shadows of the Past")
            .append("number_of_pages", 481)
            .append("genres", List.of("Biography", "Graphic Novel", "Dystopian", "Drama"))
            .append(
                "metadata",
                Map.of(
                    "isbn", "978-1-905585-40-3",
                    "language", "French",
                    "edition", "Anniversary Edition"));
    Optional<Document> result = collection.findOneAndReplace(filter, newDocument);
    System.out.println(result);
  }
}
