import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.Update;
import com.datastax.astra.client.collections.commands.results.CollectionUpdateResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Find a document
    Filter filter =
        Filters.and(Filters.eq("areas.r&&d", false), Filters.lt("costs.price&.usd", 300));
    Update update = Update.create().set("areas.r&&d", true).set("costs.price&.usd", 310);
    CollectionUpdateResult result = collection.updateMany(filter, update);
    System.out.println(result.getMatchedCount());
    System.out.println(result.getModifiedCount());
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.Update;
import com.datastax.astra.client.collections.commands.results.CollectionUpdateResult;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.internal.utils.EscapeUtils;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Find a document
    Filter filter =
        Filters.and(
            Filters.eq(EscapeUtils.escapeFieldNames("areas", "r&d"), false),
            Filters.lt(EscapeUtils.escapeFieldNames("costs", "price.usd"), 300));
    Update update =
        Update.create()
            .set(EscapeUtils.escapeFieldNames("areas", "r&d"), true)
            .set(EscapeUtils.escapeFieldNames("costs", "price.usd"), 310);
    CollectionUpdateResult result = collection.updateMany(filter, update);
    System.out.println(result.getMatchedCount());
    System.out.println(result.getModifiedCount());
  }
}
