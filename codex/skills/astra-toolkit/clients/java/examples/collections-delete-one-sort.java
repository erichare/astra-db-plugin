import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionDeleteOneOptions;
import com.datastax.astra.client.collections.commands.results.CollectionDeleteResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.core.query.Sort;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Delete a document
    Filter filter = Filters.eq("metadata.language", "English");
    CollectionDeleteOneOptions options =
        new CollectionDeleteOneOptions().sort(Sort.ascending("rating"), Sort.descending("title"));
    CollectionDeleteResult result = collection.deleteOne(filter, options);
    System.out.println(result.getDeletedCount());
  }
}
