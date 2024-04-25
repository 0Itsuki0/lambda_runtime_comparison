use aws_sdk_dynamodb::Client;
use lambda_http::{run, service_fn, tracing, Body, Error, Request, Response};

/// This is the main body for the function.
/// Write your code inside it.
/// You can see more examples in Runtime's repository:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
async fn handle_request(db_client: &Client) -> Result<Response<Body>, Error> {
    //Log into Cloudwatch
    tracing::info!("Request received");

    //Insert into the table.
    let tables = list_tables(db_client).await?;

    //Deserialize into json to return in the Response
    let j = serde_json::json!({
        "tables": tables
    })
    .to_string();

    //Send back a 200 - success
    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(j.into())
        .map_err(Box::new)?;
    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    // required to enable CloudWatch error logging by the runtime
    tracing::init_default_subscriber();

    //Get config from environment.
    let config = aws_config::load_from_env().await;
    //Create the DynamoDB client.
    let client = Client::new(&config);

    run(service_fn(|_event: Request| async {
        handle_request(&client).await
    }))
    .await
}

// Add an item to a table.
// snippet-start:[dynamodb.rust.add-item]
async fn list_tables(client: &Client) -> Result<Vec<String>, Error> {
    let resp = client.list_tables().limit(100).send().await?;
    let table_names = resp.table_names();

    println!("Tables:");

    for name in table_names {
        println!("  {}", name);
    }

    println!("Found {} tables", table_names.len());
    Ok(table_names.to_owned())
}
