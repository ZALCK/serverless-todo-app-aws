import { TodosAccess } from './todosAcess'
import { generatePresignedUrl } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('bussinesstodos')
const todoAccess = new TodosAccess()

export function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info(`Creating todo with userID: ${userId}`);
    const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
    // Generate an unique ID with uuid
    const todoId =  uuid()
    
    return todoAccess.createTodo({
        userId: userId,
        todoId: todoId,
        attachmentUrl:  `https://${s3BucketName}.s3.amazonaws.com/${todoId}`, 
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest
    });
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<TodoUpdate> {
    logger.info(`Updating todo-ID ${todoId} with userID: ${userId}`)

    return todoAccess.updateTodo(updateTodoRequest, todoId, userId);
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting todos with userID: ${userId}`)

    return todoAccess.getTodosByUserId(userId);
}

export async function deleteTodo(todoId: string, userId: string): Promise<string> {
    logger.info(`Deleting todo-ID ${todoId} with userID: ${userId}`)

    return todoAccess.deleteTodo(todoId, userId);
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info(`Creating presigned url for todo-ID ${todoId} with userID: ${userId}`)
    
    return generatePresignedUrl(todoId);
}