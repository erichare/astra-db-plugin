import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionFindOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.paging.Page;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Projection;
import com.datastax.astra.client.databases.Database;
import java.util.List;

public class Example {

  public static void main(String[] args) {

    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    Collection<Document> oldCollection = database.getCollection("**OLD_COLLECTION_NAME**");
    Collection<Document> newCollection = database.getCollection("**NEW_COLLECTION_NAME**");

    String pageState = null;
    int migratedCount = 0;

    // Use an empty filter to migrate all documents
    Filter filter = null;

    // You must explicitly include $vectorize.
    // $vector is excluded by default.
    // _id and any other fields that don't start with $ are included by default.
    Projection projection = new Projection("$vectorize", true);

    while (true) {
      Page<Document> page =
          oldCollection.findPage(
              filter, new CollectionFindOptions().projection(projection).pageState(pageState));

      List<Document> documents = page.getResults();

      pageState = page.getPageState().orElse(null);

      if (documents == null || documents.isEmpty()) {
        System.out.println("No more documents. Migration complete.");
        break;
      }

      // Insert the documents to the new collection.
      // _id and the other field values (excluding $vector) will be the same.
      // $vector will automatically be generated based on the value of $vectorize.
      newCollection.insertMany(documents);

      migratedCount += documents.size();

      System.out.println("Migrated " + migratedCount + " documents. Page state: " + pageState);

      if (pageState == null) {
        System.out.println("Reached final page. Migration complete.");
        break;
      }
    }
  }
}
