import "@total-typescript/ts-reset";
import { GithubLoader } from "./GithubLoader";
import { Document } from "langchain/document";
import { embedDocument } from "./embeddings";
import { Pinecone } from "@pinecone-database/pinecone";
import { summariseCode } from "./openai";

export function convertToAscii(inputString: string) {
  // remove non ascii characters
  const asciiString = inputString.replace(/[^\x00-\x7F]+/g, "");
  return asciiString;
}

export const getPineconeClient = () => {
  return new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

export const loadGithubIntoPinecone = async (githubUrl: string) => {
  const githubLoader = new GithubLoader();
  /* Split the text into chunks */
  const pages = await githubLoader.loadFromURL(githubUrl);
  console.log("length", pages.length);
  const documents = (await Promise.all(pages.map(prepareDocument))).filter(
    Boolean
  );

  // 3. vectorise and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("chatpdf");
  const projectName = githubUrl.split("/").slice(-1)[0];
  const namespace = pineconeIndex.namespace(convertToAscii(projectName));

  const batchSize = 100;
  const batches = [];
  for (let i = 0; i < vectors.length; i += batchSize) {
    batches.push(vectors.slice(i, i + batchSize));
  }
  await Promise.all(batches.map((batch) => namespace.upsert(batch)));

  return projectName;
};

async function prepareDocument(page: Document) {
  let { pageContent, metadata } = page;
  const summary = await summariseCode(pageContent, metadata.source);
  // split the docs
  const doc = new Document({
    pageContent: summary ?? pageContent ?? "",
    metadata: {
      source: metadata.source,
      code: pageContent,
      summary,
    },
  });
  if (!doc.pageContent) return null;
  return doc;
}
// await loadGithubIntoPinecone("https://github.com/travisleow/codehub");
