import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneAndReplaceOptions;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.core.query.Projection;
import com.datastax.astra.client.core.query.Sort;
import java.util.Map;
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
    CollectionFindOneAndReplaceOptions options =
        new CollectionFindOneAndReplaceOptions()
            .sort(Sort.ascending("areas.r&&d"), Sort.descending("costs.price&.usd"))
            .projection(Projection.include("areas.r&&d", "costs.price&.usd"));
    Document newDocument =
        new Document()
            .append(
                "areas",
                Map.of(
                    "r&d", false,
                    "design", true))
            .append(
                "costs",
                Map.of(
                    "price.usd", 100,
                    "price.cad", 90));
    Optional<Document> result = collection.findOneAndReplace(filter, newDocument, options);
    System.out.println(result);
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Filters;
import com.datastax.astra.client.core.query.Sort;
import com.datastax.astra.client.core.query.Projection;
import java.util.Map;
import java.util.Optional;
import com.datastax.astra.internal.utils.EscapeUtils;
import com.datastax.astra.client.collections.commands.options.CollectionFindOneAndReplaceOptions;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Find a document
    Filter filter =
        Filters.and(Filters.eq(EscapeUtils.escapeFieldNames("areas", "r&d"), false), Filters.lt(EscapeUtils.escapeFieldNames("costs", "price.usd"), 300));
    CollectionFindOneAndReplaceOptions options =
        new CollectionFindOneAndReplaceOptions()
            .sort(Sort.ascending(EscapeUtils.escapeFieldNames("areas", "r&d")), Sort.descending(EscapeUtils.escapeFieldNames("costs", "price.usd")))
            .projection(Projection.include(EscapeUtils.escapeFieldNames("areas", "r&d"), EscapeUtils.escapeFieldNames("costs", "price.usd")));
    Document newDocument =
        new Document()
            .append(
                "areas",
                Map.of(
                    "r&d", false,
                    "design", true))
            .append(
                "costs",
                Map.of(
                    "price.usd", 100,
                    "price.cad", 90));
    Optional<Document> result = collection.findOneAndReplace(filter, newDocument, options);
    System.out.println(result);
  }
}
