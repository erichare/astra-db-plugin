import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.Collection;
import com.datastax.astra.client.collections.commands.cursor.CollectionFindAndRerankCursor;
import com.datastax.astra.client.collections.commands.options.CollectionFindAndRerankOptions;
import com.datastax.astra.client.collections.definition.documents.Document;
import com.datastax.astra.client.core.hybrid.Hybrid;
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
    Hybrid hybrid =
        new Hybrid().vector(new float[] {0.08f, -0.62f, 0.39f}).lexical("house hill grassy");
    CollectionFindAndRerankCursor<Document, Document> cursor =
        collection.findAndRerank(
            new CollectionFindAndRerankOptions()
                .sort(Sort.hybrid(hybrid))
                .includeScores(true)
                .rerankOn("$lexical")
                .rerankQuery("A tree in the woods"));

    // Iterate over the scores for the found documents
    for (RerankedResult<Document> result : cursor) {
      System.out.println(result.getScores());
    }
  }
}
