"use server";
import { S3Client, PutObjectCommand, ObjectCannedACL, GetObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadFile = async (fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string> => {
  try {
    const uniqueFileName = `${randomUUID()}-${fileName}`;

    if (process.env.NODE_ENV !== "production") {
      const localUploadPath = path.join(process.cwd(), "uploads");
      const localFilePath = path.join(localUploadPath, uniqueFileName);
      await fs.writeFile(localFilePath, fileBuffer);
      return localFilePath;
    }

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: ObjectCannedACL.public_read,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed");
  }
};

export const getFile = async (fileName: string): Promise<Buffer> => {
  try {
    if (process.env.NODE_ENV !== "production") {
      const localFilePath = fileName;
      return await fs.readFile(localFilePath);
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
    });

    const response = await s3.send(command);

    if (!response.Body) {
      throw new Error("File not found in S3");
    }

    const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    };

    return await streamToBuffer(response.Body as Readable);
  } catch (error) {
    console.error("Error retrieving file:", error);
    throw new Error("File retrieval failed");
  }
};
