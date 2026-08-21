import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.cursor.CollectionFindCursor;
import com.datastax.astra.client.collections.commands.options.CollectionFindOptions;
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
    CollectionFindOptions options =
        new CollectionFindOptions().sort(Sort.vectorize("Text to vectorize"));
    CollectionFindCursor<Document, Document> cursor = collection.find(options);

    for (Document document : cursor) {
      System.out.println(document);
    }
  }
}
