import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.collections.exceptions.TooManyDocumentsToCountException;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;

public class Example {
  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Count documents
    Filter filter =
        Filters.and(Filters.eq("is_checked_out", false), Filters.lt("number_of_pages", 300));

    try {
      Integer result = collection.countDocuments(filter, 500);
      System.out.println(result);
    } catch (TooManyDocumentsToCountException error) {
      System.out.println("Number of documents exceeds upper bound or API limit");
    }
  }
}
