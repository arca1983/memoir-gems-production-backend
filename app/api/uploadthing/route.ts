import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

const uploadthingToken = process.env.UPLOADTHING_TOKEN?.trim().replace(/^['"]|['"]$/g, "");

if (!uploadthingToken) {
  throw new Error("Missing UPLOADTHING_TOKEN");
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: uploadthingToken,
  },
});
