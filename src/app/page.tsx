"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent } from "react";

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const selectedFile = (e.target as HTMLInputElement).files;
  console.log(selectedFile);
  // const formData = new FormData();
  // formData.append("files", data.files);
  // const url = await fetch("/api/test", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ file: buffer, fileType: selectedFile.type }),
  // });
  // console.log(url);
}
export default function Home() {
  return (
    <>
      <form onSubmit={handleSubmit}>
        <Input id="file" name="file" type="file" />
        <Input name="txt" type="text" />
        <Button type="submit"></Button>
      </form>
    </>
  );
}
