import fs from "fs";
import mime from "mime-types";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEN_AI_KEY;
const fileManager = new GoogleAIFileManager(API_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEN_AI_KEY });

/**
 * Summarizes any file type using Google Gemini AI.
 * @param {string} filePath - Path to the file.
 * @returns {Promise<string>} - The summarized text.
 */
async function summarizeFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found.");
    }

    // Auto-detect MIME type
    // const mimeType = mime.lookup(filePath) || "application/octet-stream";
    const uploadResult = await ai.files.upload({
      file: filePath,
    });
    console.log("uploadResult: ", uploadResult);
    // Upload the file with detected MIME type
    // const uploadResult = await fileManager.uploadFile(filePath, {
    //   mimeType: mimeType, // Required for Gemini API
    //   displayName: filePath.split("/").pop(),
    // });
    // let file = await fileManager.getFile(uploadResult.file.name);

    // Wait until file processing is complete
    // while (file.state === FileState.PROCESSING) {
    //   process.stdout.write(".");
    //   await new Promise((resolve) => setTimeout(resolve, 10_000));
    //   file = await fileManager.getFile(uploadResult.file.name);
    // }

    // if (file.state === FileState.FAILED) {
    //   throw new Error("File processing failed.");
    // }

    // Generate summary using Gemini AI
    // const genAI = new GoogleGenerativeAI(API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // const result = await model.generateContent({
    //   contents: createUserContent([createPartFromUri(uploadResult.file.uri, uploadResult.file.mimeType), "\n\n", "Summarize this file"]),
    // "Summarize this file:",
    // {
    //   fileData: {
    //     fileUri: uploadResult.file.uri,
    //     mimeType: mimeType,
    //   },
    // },
    // });
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: createUserContent([
        createPartFromUri(uploadResult.uri, uploadResult.mimeType),
        "\n\n",
        "Summarize this file, include no other details.",
      ]),
    });

    return result.text;
  } catch (error) {
    console.error("Error summarizing file:", error);
    throw error;
  }
}

export default summarizeFile;
