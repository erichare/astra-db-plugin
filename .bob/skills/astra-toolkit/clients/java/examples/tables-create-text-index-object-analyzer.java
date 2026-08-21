import static com.datastax.astra.client.core.lexical.AnalyzerTypes.STANDARD;

import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.lexical.Analyzer;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.indexes.TableTextIndexDefinition;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Index a column
    Analyzer analyzer =
        new Analyzer()
            .tokenizer(STANDARD.getValue())
            .addFilter("lowercase")
            .addFilter("stop")
            .addFilter("porterstem")
            .addFilter("asciifolding");
    TableTextIndexDefinition definition =
        new TableTextIndexDefinition().column("**TEXT_COLUMN_NAME**").analyzer(analyzer);
    table.createTextIndex("**INDEX_NAME**", definition);
  }
}
