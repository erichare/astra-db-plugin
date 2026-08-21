import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.cursor.CollectionFindAndRerankCursor;
import com.datastax.astra.client.collections.commands.options.CollectionFindAndRerankOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Projection;
import com.datastax.astra.client.core.query.Sort;
import com.datastax.astra.client.core.rerank.RerankedResult;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Find documents
    Filter filter = null;
    CollectionFindAndRerankCursor<Document, Document> cursor =
        collection.findAndRerank(
            filter, new CollectionFindAndRerankOptions().sort(Sort.hybrid("A tree in the woods")));

    cursor.project(Projection.include("title", "is_checked_out"));

    // Iterate over the results
    for (RerankedResult<Document> result : cursor) {
      System.out.println(result.getDocument());
    }
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.cursor.CollectionFindAndRerankCursor;
import com.datastax.astra.client.collections.commands.options.CollectionFindAndRerankOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.query.Filter;
import com.datastax.astra.client.core.query.Projection;
import com.datastax.astra.client.core.query.Sort;
import com.datastax.astra.client.core.rerank.RerankedResult;

public class Example {

  public static void main(String[] args) {
    // Get an existing collection
    Collection<Document> collection =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getCollection("**COLLECTION_NAME**");

    // Find documents
    Filter filter = null;
    CollectionFindAndRerankCursor<Document, Document> cursor =
        collection.findAndRerank(
            filter,
            new CollectionFindAndRerankOptions()
                .projection(Projection.include("is_checked_out", "title"))
                .sort(Sort.hybrid("A tree in the woods")));

    // Iterate over the results
    for (RerankedResult<Document> result : cursor) {
      System.out.println(result.getDocument());
    }
  }
}
