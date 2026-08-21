// tag::pre-row-class[]
import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.core.vector.DataAPIVector;
import com.datastax.astra.client.core.vector.SimilarityMetric;
import com.datastax.astra.client.databases.Database;
import com.datastax.astra.client.tables.Table;
import com.datastax.astra.client.tables.definition.columns.ColumnTypes;
import com.datastax.astra.client.tables.mapping.Column;
import com.datastax.astra.client.tables.mapping.ColumnVector;
import com.datastax.astra.client.tables.mapping.EntityTable;
import com.datastax.astra.client.tables.mapping.KeyValue;
import com.datastax.astra.client.tables.mapping.PartitionBy;
import lombok.Data;

public class Example {
// end::pre-row-class[]

// tag::row-class-external-provider[]
    @EntityTable("TABLE_NAME")
    @Data
    public class ExampleRow {
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        @ColumnVector(
            name = "VECTOR_COLUMN_NAME",
            dimension = MODEL_DIMENSIONS,
            metric = SimilarityMetric.SIMILARITY_METRIC,
            provider = "{embedding-provider-name-api}",
            modelName = "MODEL_NAME",
            authentication = @KeyValue(key = "providerKey", value = "API_KEY_NAME"))
        private DataAPIVector exampleVector;

        // If you want to store the original text
        // in addition to the generated embeddings
        // you must create a separate column.
        // You should change the primary key definition (`PartitionBy`) to meet the needs of your data.
        @PartitionBy(0)
        @Column(name = "TEXT_COLUMN_NAME", type = ColumnTypes.TEXT)
        private String originalText;
    }
// end::row-class-external-provider[]

// tag::row-class-hugging-face-dedicated[]
    @EntityTable("TABLE_NAME")
    @Data
    public class ExampleRow {
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        @ColumnVector(
            name = "VECTOR_COLUMN_NAME",
            dimension = MODEL_DIMENSIONS,
            metric = SimilarityMetric.SIMILARITY_METRIC,
            provider = "{embedding-provider-name-api}",
            modelName = "{embedding-provider-model-name-api}",
            authentication = @KeyValue(key = "providerKey", value = "API_KEY_NAME"),
            parameters = {
                @KeyValue(key = "endpointName", value = "ENDPOINT_NAME"),
                @KeyValue(key = "regionName", value = "REGION"),
                @KeyValue(key = "cloudName", value = "CLOUD_PROVIDER")
            })
        private DataAPIVector exampleVector;

        // If you want to store the original text
        // in addition to the generated embeddings
        // you must create a separate column.
        // You should change the primary key definition (`PartitionBy`) to meet the needs of your data.
        @PartitionBy(0)
        @Column(name = "TEXT_COLUMN_NAME", type = ColumnTypes.TEXT)
        private String originalText;
    }
// end::row-class-hugging-face-dedicated[]

// tag::row-class-openai[]
    @EntityTable("TABLE_NAME")
    @Data
    public class ExampleRow {
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        @ColumnVector(
            name = "VECTOR_COLUMN_NAME",
            dimension = MODEL_DIMENSIONS,
            metric = SimilarityMetric.SIMILARITY_METRIC,
            provider = "{embedding-provider-name-api}",
            modelName = "MODEL_NAME",
            authentication = @KeyValue(key = "providerKey", value = "API_KEY_NAME"),
            parameters = {
                @KeyValue(key = "organizationId", value = "ORGANIZATION_ID"),
                @KeyValue(key = "projectId", value = "PROJECT_ID")
            })
        private DataAPIVector exampleVector;

        // If you want to store the original text
        // in addition to the generated embeddings
        // you must create a separate column.
        // You should change the primary key definition (`PartitionBy`) to meet the needs of your data.
        @PartitionBy(0)
        @Column(name = "TEXT_COLUMN_NAME", type = ColumnTypes.TEXT)
        private String originalText;
    }
// end::row-class-openai[]

// tag::row-class-azure-openai[]
    @EntityTable("TABLE_NAME")
    @Data
    public class ExampleRow {
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        @ColumnVector(
            name = "VECTOR_COLUMN_NAME",
            dimension = MODEL_DIMENSIONS,
            metric = SimilarityMetric.SIMILARITY_METRIC,
            provider = "{embedding-provider-name-api}",
            modelName = "MODEL_NAME",
            authentication = @KeyValue(key = "providerKey", value = "API_KEY_NAME"),
            parameters = {
                @KeyValue(key = "resourceName", value = "RESOURCE_NAME"),
                @KeyValue(key = "deploymentId", value = "DEPLOYMENT_ID")
            })
        private DataAPIVector exampleVector;

        // If you want to store the original text
        // in addition to the generated embeddings
        // you must create a separate column.
        // You should change the primary key definition (`PartitionBy`) to meet the needs of your data.
        @PartitionBy(0)
        @Column(name = "TEXT_COLUMN_NAME", type = ColumnTypes.TEXT)
        private String originalText;
    }
// end::row-class-azure-openai[]

// tag::row-class-hosted-provider[]
    @EntityTable("TABLE_NAME")
    @Data
    public class ExampleRow {
        // This column will store vector embeddings.
        // The {embedding-provider-name} integration
        // will automatically generate vector embeddings
        // for any text inserted to this column.
        @ColumnVector(
            name = "VECTOR_COLUMN_NAME",
            provider = "{embedding-provider-name-api}",
            modelName = "{embedding-provider-model-name-api}")
        private DataAPIVector exampleVector;

        // If you want to store the original text
        // in addition to the generated embeddings
        // you must create a separate column.
        // You should change the primary key definition (`PartitionBy`) to meet the needs of your data.
        @PartitionBy(0)
        @Column(name = "TEXT_COLUMN_NAME", type = ColumnTypes.TEXT)
        private String originalText;
    }
// end::row-class-hosted-provider[]

// tag::post-row-class[]
    public static void main(String[] args) {
    // Instantiate the client
    DataAPIClient client = new DataAPIClient(new DataAPIClientOptions());

    // Connect to a database
    Database database =
        client.getDatabase(
            "API_ENDPOINT",
            new DatabaseOptions("APPLICATION_TOKEN", new DataAPIClientOptions()));

    // Create the table
    Table<ExampleRow> table = database.createTable(ExampleRow.class);
  }
}
// end::post-row-class[]
