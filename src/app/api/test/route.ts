import { getFile, uploadFile } from "@/lib/uploadFile";
import { NextRequest } from "next/server";

// How to upload file and get file

export async function POST(req: Request) {
  try {
    const { file, fileType } = await req.json();
    const fileBuffer = Buffer.from(file);
    const url = await uploadFile("TEST", fileBuffer, fileType);
    return Response.json({ success: true, url });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Response.json({ success: false, err: error.message });
  }
}

export async function GET(req: NextRequest) {
  try {
    const fileName = req.nextUrl.searchParams.get("fileName");
    console.log("fileName", fileName);
    const fileBuffer = await getFile(fileName);
    return Response.json({ success: true, fileBuffer });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return Response.json({ success: false, err: error.message });
  }
}
