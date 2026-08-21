import static com.datastax.astra.client.core.lexical.AnalyzerTypes.STANDARD;

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.definition.CollectionDefinition;
import com.datastax.astra.client.core.lexical.Analyzer;
import com.datastax.astra.client.core.lexical.LexicalOptions;
import com.datastax.astra.client.core.vector.SimilarityMetric;
import com.datastax.astra.client.databases.Database;
import java.util.ArrayList;
import java.util.HashMap;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    database.createCollection(
        "**COLLECTION_NAME**",
        new CollectionDefinition()
            .vector(1024, SimilarityMetric.COSINE)
            .vectorize("nvidia", "nvidia/nv-embedqa-e5-v5")
            .lexical(
                new LexicalOptions()
                    .enabled(true)
                    .analyzer(
                        new Analyzer()
                            .tokenizer(STANDARD.getValue(), new HashMap<>())
                            .charFilters(new ArrayList<>())
                            .addFilter("lowercase")
                            .addFilter("stop")
                            .addFilter("porterstem")
                            .addFilter("asciifolding")))
            .rerank("nvidia", "nvidia/llama-3.2-nv-rerankqa-1b-v2"));
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import static com.datastax.astra.client.core.lexical.AnalyzerTypes.STANDARD;

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.definition.CollectionDefinition;
import com.datastax.astra.client.core.lexical.Analyzer;
import com.datastax.astra.client.core.lexical.LexicalOptions;
import com.datastax.astra.client.core.rerank.CollectionRerankOptions;
import com.datastax.astra.client.core.rerank.RerankServiceOptions;
import com.datastax.astra.client.core.vector.SimilarityMetric;
import com.datastax.astra.client.core.vector.VectorOptions;
import com.datastax.astra.client.core.vectorize.VectorServiceOptions;
import com.datastax.astra.client.databases.Database;
import java.util.ArrayList;
import java.util.HashMap;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Create a collection
    CollectionDefinition collectionDefinition = new CollectionDefinition();

    // Vector Options
    VectorServiceOptions vectorService =
        new VectorServiceOptions().provider("nvidia").modelName("nvidia/nv-embedqa-e5-v5");
    VectorOptions vectorOptions =
        new VectorOptions()
            .dimension(1024)
            .metric(SimilarityMetric.COSINE.getValue())
            .service(vectorService);
    collectionDefinition.vector(vectorOptions);

    // Lexical Options
    Analyzer analyzer =
        new Analyzer()
            .tokenizer(STANDARD.getValue(), new HashMap<>())
            .charFilters(new ArrayList<>())
            .addFilter("lowercase")
            .addFilter("stop")
            .addFilter("porterstem")
            .addFilter("asciifolding");
    LexicalOptions lexicalOptions = new LexicalOptions().enabled(true).analyzer(analyzer);
    collectionDefinition.lexical(lexicalOptions);

    // Rerank Options
    RerankServiceOptions rerankService =
        new RerankServiceOptions()
            .modelName("nvidia/llama-3.2-nv-rerankqa-1b-v2")
            .provider("nvidia");
    CollectionRerankOptions rerankOptions =
        new CollectionRerankOptions().enabled(true).service(rerankService);
    collectionDefinition.rerank(rerankOptions);

    database.createCollection("**COLLECTION_NAME**", collectionDefinition);
  }
}
