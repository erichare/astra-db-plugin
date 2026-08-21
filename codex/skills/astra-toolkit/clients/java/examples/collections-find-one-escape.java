import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.core.query.Projection;
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
    Filter filter =
        Filters.and(Filters.eq("areas.r&&d", false), Filters.lt("costs.price&.usd", 300));
    CollectionFindOneOptions options =
        new CollectionFindOneOptions()
            .sort(Sort.ascending("costs.price&.usd"))
            .projection(Projection.include("areas.r&&d", "costs.price&.cad"));
    Optional<Document> result = collection.findOne(filter, options);
    System.out.println(result);
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.core.query.Projection;
import com.datastax.astra.client.core.query.Sort;
import com.datastax.astra.internal.utils.EscapeUtils;
import java.util.Optional;

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
    CollectionFindOneOptions options =
        new CollectionFindOneOptions()
            .sort(Sort.ascending(EscapeUtils.escapeFieldNames("costs", "price.usd")))
            .projection(
                Projection.include(
                    EscapeUtils.escapeFieldNames("areas", "r&d"),
                    EscapeUtils.escapeFieldNames("costs", "price.cad")));
    Optional<Document> result = collection.findOne(filter, options);
    System.out.println(result);
  }
}
