from astrapy import DataAPIClient
from astrapy.api_options import (
    APIOptions,
    SerdesOptions,
    TimeoutOptions,
)
from astrapy.authentication import (
    AWSEmbeddingHeadersProvider,
)

client = DataAPIClient(
    api_options=APIOptions(
        embedding_api_key=AWSEmbeddingHeadersProvider(
            embedding_access_id="my-access-id",
            embedding_secret_id="my-secret-id",
        ),
        timeout_options=TimeoutOptions(
            request_timeout_ms=15000,
            general_method_timeout_ms=30000,
            table_admin_timeout_ms=120000,
        ),
        serdes_options=SerdesOptions(
            custom_datatypes_in_reading=False,
            use_decimals_in_collections=True,
        ),
    )
)
