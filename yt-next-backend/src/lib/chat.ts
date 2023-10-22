import { ChatCompletionRequestMessage, ResponseTypes } from "openai-edge";
// import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "./context";
import { openai } from "./openai";
import { convertToAscii } from "./pinecone";
import escape from "escape-html";
// import { NextResponse } from "next/server";

// export const runtime = "edge";

export async function ask(qn: string, projectName: string) {
  try {
    const context = await getContext(qn, projectName);

    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    } as ChatCompletionRequestMessage;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [prompt, { role: "user", content: qn }],
    });
    const data =
      (await response.json()) as ResponseTypes["createChatCompletion"];
    const content = data.choices[0].message?.content;
    return content;
    // return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
  }
}

export async function generateDocumentation(
  projectName: string,
  githubUrl: string
) {
  const questions = [
    "What is the project about?",
    "How can I get started with this project?",
    "What does the project's repository contain?",
    "Are there any coding standards or guidelines I should follow?",
    "What dependencies, packages, APIs, or libraries does the project use? Look into the package.json file.",
    "How can I build and compile the project?",
    "What should I know about testing in this project?",
    "How can I contribute to the project?",
    "How are issues tracked in this project?",
    "What's the version control strategy for this project?",
    "Tell me about the project's CI/CD pipeline.",
    "Where should I add documentation and comments in the codebase?",
  ];
  const answers = await Promise.all(
    questions.map((qn) => ask(qn, projectName))
  );
  const documentation = questions.map((qn, i) => {
    return {
      question: escape(qn),
      answer: escape(answers[i]),
    };
  });
  // template the documentation and make it into a nice markdown format just like a readme
  let markdown = `
  <h1>${projectName}</h1>\n
  <a href="${githubUrl}">Github Repository</a>\n
  <h2>Table of Contents</h2>\n
  <ul>\n
  <li><a href="#introduction">Introduction</a></li>\n
  <li><a href="#getting-started">Getting Started</a></li>\n
  <li><a href="#repository">Repository</a></li>\n
  <li><a href="#coding-standards">Coding Standards</a></li>\n
  <li><a href="#dependencies">Dependencies</a></li>\n
  <li><a href="#building-and-compiling">Building and Compiling</a></li>\n
  <li><a href="#testing">Testing</a></li>\n
  <li><a href="#contributing">Contributing</a></li>\n
  <li><a href="#issues">Issues</a></li>\n
  <li><a href="#version-control">Version Control</a></li>\n
  <li><a href="#ci-cd">CI/CD</a></li>\n
  </ul>\n

  <h2 id="introduction">Introduction</h2>\n
  <p>${documentation[0].answer}</p>\n
  <h2 id="getting-started">Getting Started</h2>\n
  <p>${documentation[1].answer}</p>\n
  <h2 id="repository">Repository</h2>\n
  <p>${documentation[2].answer}</p>\n
  <h2 id="coding-standards">Coding Standards</h2>\n
  <p>${documentation[3].answer}</p>\n
  <h2 id="dependencies">Dependencies</h2>\n
  <p>${documentation[4].answer}</p>\n
  <h2 id="building-and-compiling">Building and Compiling</h2>\n
  <p>${documentation[5].answer}</p>\n
  <h2 id="testing">Testing</h2>\n
  <p>${documentation[6].answer}</p>\n
  <h2 id="contributing">Contributing</h2>\n
  <p>${documentation[7].answer}</p>\n
  <h2 id="issues">Issues</h2>\n
  <p>${documentation[8].answer}</p>\n
  <h2 id="version-control">Version Control</h2>\n
  <p>${documentation[9].answer}</p>\n
  <h2 id="ci-cd">CI/CD</h2>\n
  <p>${documentation[10].answer}</p>\n
  `;
  return markdown;
}
