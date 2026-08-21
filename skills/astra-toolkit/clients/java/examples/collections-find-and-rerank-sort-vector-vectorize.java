import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.cursor.CollectionFindAndRerankCursor;
import com.datastax.astra.client.collections.commands.options.CollectionFindAndRerankOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Sort;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Find documents
    CollectionFindAndRerankCursor<Document, Document> cursor =
        collection.findAndRerank(
            new CollectionFindAndRerankOptions()
                .sort(Sort.hybrid("A tree in the woods"))
                .includeSortVector(true));

    // Get the sort vector
    cursor
        .getSortVector()
        .ifPresent(
            vector -> {
              System.out.println(vector);
            });
  }
}
