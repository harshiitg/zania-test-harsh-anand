import { rest } from 'msw';
import { mock } from './mock';

const handlers = [
  rest.get("/documents", (req, res, ctx) => {
    const storedDocuments = localStorage.getItem("documents")
      ? JSON.parse(localStorage.getItem("documents") as string)
      : [];
      
    if (storedDocuments.length) {
      return res(
        ctx.status(200),
        ctx.json({ data: storedDocuments })
      );
    } else {
      return res(
        ctx.status(200),
        ctx.json({ data: mock })
      );
    }
  }),

  rest.post("/documents-post", async (req, res, ctx) => {
    const requestBody = await req.json();
    localStorage.setItem("documents", JSON.stringify(requestBody));
    
    return res(
      ctx.status(201),
      ctx.json({
        documents: requestBody,
        createdAt: new Date().toLocaleString(),
      })
    );
  }),
];

export default handlers;
