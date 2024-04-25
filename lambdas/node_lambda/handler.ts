import { Handler } from 'aws-lambda';
import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";


const dynamoClient = new DynamoDBClient();

export const handler: Handler = async (event, context) => {
    const command = new ListTablesCommand({
        Limit: 100
    });

    const response = await dynamoClient.send(command);
    console.log(response.TableNames);
    const tableNames = response.TableNames;
    return {
        statusCode: 200,
        body: JSON.stringify({
            "tables": tableNames
        }),
    }
};