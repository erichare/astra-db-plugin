import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionFindOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.paging.Page;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Create the filter
    Filter filter =
        Filters.and(Filters.eq("is_checked_out", false), Filters.lt("number_of_pages", 300));

    // Get the first page
    Page<Document> page1 = collection.findPage(filter, null);
    page1.getResults().forEach(System.out::println);
    String paginationState1 = page1.getPageState().orElse(null);

    // Get the next page
    if (paginationState1 != null) {
      Page<Document> page2 =
          collection.findPage(filter, new CollectionFindOptions().pageState(paginationState1));
      page2.getResults().forEach(System.out::println);
    }
  }
}
