import static com.datastax.astra.client.core.lexical.AnalyzerTypes.STANDARD;

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.definition.CollectionDefinition;
import com.datastax.astra.client.core.lexical.Analyzer;
import com.datastax.astra.client.core.lexical.LexicalOptions;
import com.datastax.astra.client.databases.Database;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    database.createCollection(
        "**COLLECTION_NAME**",
        new CollectionDefinition()
            .lexical(
                new LexicalOptions()
                    .enabled(true)
                    .analyzer(
                        new Analyzer()
                            .tokenizer(STANDARD.getValue())
                            .addFilter("lowercase")
                            .addFilter("stop")
                            .addFilter("porterstem")
                            .addFilter("asciifolding"))));
  }
}

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import static com.datastax.astra.client.core.lexical.AnalyzerTypes.STANDARD;

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.collections.definition.CollectionDefinition;
import com.datastax.astra.client.core.lexical.Analyzer;
import com.datastax.astra.client.core.lexical.LexicalOptions;
import com.datastax.astra.client.databases.Database;

public class Example {

  public static void main(String[] args) {
    // Get a database
    Database database = new DataAPIClient("**APPLICATION_TOKEN**").getDatabase("**API_ENDPOINT**");

    // Create a collection
    CollectionDefinition collectionDefinition = new CollectionDefinition();

    // Lexical Options
    Analyzer analyzer =
        new Analyzer()
            .tokenizer(STANDARD.getValue())
            .addFilter("lowercase")
            .addFilter("stop")
            .addFilter("porterstem")
            .addFilter("asciifolding");
    LexicalOptions lexicalOptions = new LexicalOptions().enabled(true).analyzer(analyzer);
    collectionDefinition.lexical(lexicalOptions);

    database.createCollection("**COLLECTION_NAME**", collectionDefinition);
  }
}
