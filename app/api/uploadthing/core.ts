import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  photoUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 50,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload complete:", file.name);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
