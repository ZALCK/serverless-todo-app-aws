import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

//const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('auth')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info("Creating new todo")
        
        const params = {
            TableName: this.todosTable,
            Item: todoItem,
        };
    
        await this.docClient.put(params).promise();
    
        return todoItem as TodoItem;
    }

    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        logger.info("Updating a todo")
        
        const params = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #nameField = :nameField, #dueDateField = :dueDateField, #doneField = :doneField",
            ExpressionAttributeNames: {
                "#nameField": "name",
                "#dueDateField": "dueDate",
                "#doneField": "done"
            },
            ExpressionAttributeValues: {
                ":nameField": todoUpdate.name,
                ":dueDateField": todoUpdate.dueDate,
                ":doneField": todoUpdate.done
            },
            ReturnValues: "ALL_NEW"
        };
    
        const result = await this.docClient.update(params).promise();
    
        return result.Attributes as TodoUpdate;
    }
    
    async getTodosByUserId(userId: string): Promise<TodoItem[]> {
        logger.info("Getting todos by user Id")
    
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
    
        return result.Items as TodoItem[];
    }

    async deleteTodo(todoId: string, userId:string): Promise<string> {
        logger.info("Deleting todo")

        const params = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        await this.docClient.delete(params).promise();

        return "" as string;
    }
}
