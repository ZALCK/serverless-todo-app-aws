import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
//import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
//import { TodoUpdate } from '../models/TodoUpdate';

//const XAWS = AWSXRay.captureAWS(AWS)

//const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
//const docClient: DocumentClient = new AWS.DynamoDB.DocumentClient()

//const todosTable = process.env.TODOS_TABLE
//const userIdIndex = process.env.USER_ID_INDEX



export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        console.log("Creating new todo");
        const params = {
            TableName: this.todosTable,
            Item: todoItem,
        };
    
        const result = await this.docClient.put(params).promise();
        console.log(result);
    
        return todoItem as TodoItem;
    }
    
    async getTodosByUserId(userId: string): Promise<TodoItem[]> {
        console.log("Getting todos by user Id");
    
        const params = {
            TableName: this.todosTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };
    
        const result = await this.docClient.query(params).promise();
        console.log(result);
        const items = result.Items;
    
        return items as TodoItem[];
    }

}
