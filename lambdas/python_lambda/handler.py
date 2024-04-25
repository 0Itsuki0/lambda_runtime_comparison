import json
import boto3

dynamo_client = boto3.client('dynamodb')

def lambda_handler(event, context):
    
    response = dynamo_client.list_tables(
        Limit=100
    )
    table_names = response['TableNames']


    return {
        'statusCode': 200,
        'body': json.dumps({
            "tables": table_names
        })
    }