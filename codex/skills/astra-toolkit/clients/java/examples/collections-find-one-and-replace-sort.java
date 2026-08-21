import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneAndReplaceOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.core.query.Sort;
import java.util.Optional;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Find a document
    Filter filter = Filters.eq("metadata.language", "English");
    CollectionFindOneAndReplaceOptions options =
        new CollectionFindOneAndReplaceOptions()
            .sort(Sort.ascending("rating"), Sort.descending("title"));
    Document newDocument =
        new Document().append("is_checked_out", false).append("number_of_pages", 400);
    Optional<Document> result = collection.findOneAndReplace(filter, newDocument, options);
    System.out.println(result);
  }
}
