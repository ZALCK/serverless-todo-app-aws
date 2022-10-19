import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStorage logic
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export function generatePresignedUrl(todoId: string) {
    const url = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: parseInt(urlExpiration)
    })

    return url as string
}