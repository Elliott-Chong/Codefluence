import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./pinecone";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  projectName: string
) {
  try {
    const client = new Pinecone({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = await client.index("chatpdf");
    const namespace = pineconeIndex.namespace(convertToAscii(projectName));
    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, projectName: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, projectName);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );

  type Metadata = {
    source: string;
    code: string;
    summary: string;
  };

  let docs = qualifyingDocs.map((match) => {
    const metadata = match.metadata as Metadata;
    return `source: ${metadata.source}\n\n summary: ${metadata.summary} code: ${metadata.code}`;
  });
  // 5 vectors
  return docs.join("\n").substring(0, 10000);
}
