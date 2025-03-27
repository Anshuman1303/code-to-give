import { z } from "zod";

export const acceptedFileTypes: string[] = [
  "application/pdf",
  "text/plain",
  "video/mp4",
  "video/mpeg",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
];

export default z.object({
  title: z.string().min(4, "Title must be at least 4 character").max(128, "Title cannot be more than 128 characters").trim(),
  file: z.instanceof(File).refine((file) => acceptedFileTypes.includes(file.type), { message: "Invalid document file type" }),
});
