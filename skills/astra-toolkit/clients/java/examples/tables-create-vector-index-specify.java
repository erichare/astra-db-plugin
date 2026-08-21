import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.vector.SimilarityMetric;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.commands.options.CreateVectorIndexOptions;
import com.datastax.astra.client.tables.definition.indexes.TableVectorIndexDefinition;
import com.datastax.astra.client.tables.definition.rows.Row;

public class Example {

  public static void main(String[] args) {
    // Get an existing table
    Table<Row> table =
        new DataAPIClient("**APPLICATION_TOKEN**")
            .getDatabase("**API_ENDPOINT**")
            .getTable("**TABLE_NAME**");

    // Index a vector column
    TableVectorIndexDefinition definition =
        new TableVectorIndexDefinition()
            .column("**VECTOR_COLUMN_NAME**")
            .metric(SimilarityMetric.DOT_PRODUCT)
            .sourceModel("nv-qa-4");
    CreateVectorIndexOptions options = new CreateVectorIndexOptions();
    table.createVectorIndex("**INDEX_NAME**", definition, options);
  }
}
