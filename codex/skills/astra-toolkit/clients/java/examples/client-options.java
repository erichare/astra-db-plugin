import com.datastax.astra.client.DataAPIClient;
import com.datastax.astra.client.DataAPIDestination;
import com.datastax.astra.client.core.headers.AWSEmbeddingHeadersProvider;
import com.datastax.astra.client.core.headers.EmbeddingAPIKeyHeaderProvider;
import com.datastax.astra.client.core.http.HttpClientOptions;
import com.datastax.astra.client.core.http.HttpProxy;
import com.datastax.astra.client.core.options.DataAPIClientOptions;
import com.datastax.astra.client.core.options.TimeoutOptions;
import com.datastax.astra.internal.command.CommandObserver;
import com.datastax.astra.internal.command.ExecutionInfos;
import java.net.http.HttpClient;
import java.time.Duration;

public class Example {
  public static void main(String[] args) {
    DataAPIClientOptions options = new DataAPIClientOptions();

    // Specify the environment
    options.destination(DataAPIDestination.ASTRA);

    // Specify the HTTP client
    HttpClientOptions httpClientOptions =
        new HttpClientOptions()
            .retryCount(3)
            .retryDelay(Duration.ofMillis(200))
            .httpRedirect(HttpClient.Redirect.NORMAL)
            .httpVersion(HttpClient.Version.HTTP_2)
            .httpProxy(new HttpProxy().hostname("localhost").port(8080));
    options.httpClientOptions(httpClientOptions);

    // Specify timeouts
    TimeoutOptions timeoutsOptions =
        new TimeoutOptions()
            .collectionAdminTimeoutMillis(5000)
            .collectionAdminTimeout(Duration.ofMillis(5000))
            .tableAdminTimeoutMillis(5000)
            .tableAdminTimeout(Duration.ofMillis(5000))
            .databaseAdminTimeoutMillis(15000)
            .databaseAdminTimeout(Duration.ofMillis(15000))
            .generalMethodTimeoutMillis(1000)
            .generalMethodTimeout(Duration.ofMillis(1000))
            .requestTimeoutMillis(200)
            .requestTimeout(Duration.ofMillis(200))
            .connectTimeoutMillis(100)
            .connectTimeout(Duration.ofMillis(100));
    options.timeoutOptions(timeoutsOptions);

    // Add your application in the chain of callers in the header
    options.addCaller("MySampleApplication", "1.0.0");

    // Add a header to computer embeddings externally
    options.embeddingHeadersProvider(new EmbeddingAPIKeyHeaderProvider("key_embeddings"));
    options.embeddingHeadersProvider(
        new AWSEmbeddingHeadersProvider("aws_access_key", "aws_secret_key"));

    // Add headers to calls for admin or database operations
    options.addAdminAdditionalHeader("X-My-Header", "MyValue");
    options.addDatabaseAdditionalHeader("X-My-Header", "MyValue");

    // Add loggers and observers
    options.addObserver(
        "my_dummy_logger",
        new CommandObserver() {
          @Override
          public void onCommand(ExecutionInfos executionInfo) {
            System.out.println("Command executed: " + executionInfo.getCommand().getName());
          }
        });
    // Get a sl4j logger at debug level
    options.logRequests();

    DataAPIClient client = new DataAPIClient(options);
  }
}
