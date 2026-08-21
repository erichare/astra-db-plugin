import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.cursor.CollectionFindCursor;
import com.datastax.astra.client.collections.commands.options.CollectionFindOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.core.query.Projection;
import com.datastax.astra.client.core.query.Sort;

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
    CollectionFindOptions options =
        new CollectionFindOptions()
            .sort(Sort.ascending("costs.price&.usd"))
            .projection(Projection.include("areas.r&&d", "costs.price&.cad"));
    CollectionFindCursor<Document, Document> cursor = collection.find(filter, options);

    // Iterate over the found documents
    for (Document document : cursor) {
      System.out.println(document);
    }
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.cursor.CollectionFindCursor;
import com.datastax.astra.client.collections.commands.options.CollectionFindOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.core.query.Projection;
import com.datastax.astra.client.core.query.Sort;
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
    CollectionFindOptions options =
        new CollectionFindOptions()
            .sort(Sort.ascending(EscapeUtils.escapeFieldNames("costs", "price.usd")))
            .projection(
                Projection.include(
                    EscapeUtils.escapeFieldNames("areas", "r&d"),
                    EscapeUtils.escapeFieldNames("costs", "price.cad")));
    CollectionFindCursor<Document, Document> cursor = collection.find(filter, options);

    // Iterate over the found documents
    for (Document document : cursor) {
      System.out.println(document);
    }
  }
}
