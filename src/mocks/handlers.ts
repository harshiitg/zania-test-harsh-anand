import { http, HttpResponse } from "msw";
import { mock } from "./mock";

const handlers = [
  http.get("/documents", () => {
    const storedDocuments = localStorage.getItem("documents")
      ? JSON.parse(localStorage.getItem("documents") || "[]")
      : [];
    if (storedDocuments.length) {
      return HttpResponse.json({ data: storedDocuments });
    } else {
      return HttpResponse.json({ data: mock });
    }
  }),

  http.post("/documents-post", async ({ request }) => {
    const requestBody = await request.json();
    localStorage.setItem("documents", JSON.stringify(requestBody));
    return HttpResponse.json(
      {
        documents: requestBody,
        createdAt: new Date().toLocaleString(),
      },
      { status: 201 }
    );
  }),
];

export default handlers;
