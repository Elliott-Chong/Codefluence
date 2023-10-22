import { Document } from "langchain/document";
import { OpenAIApi, Configuration, ResponseTypes } from "openai-edge";
import md5 from "md5";
import { PineconeRecord } from "@pinecone-database/pinecone";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  if (!text) return [];
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });
    const result = (await response.json()) as ResponseTypes["createEmbedding"];
    return result.data[0].embedding as number[];
  } catch (error) {
    console.log("error calling openai embeddings api", error);
    throw error;
  }
}

export async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        source: doc.metadata.source,
        code: doc.metadata.code,
        summary: doc.metadata.summary,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}
