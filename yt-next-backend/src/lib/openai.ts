import { Configuration, OpenAIApi, ResponseTypes } from "openai-edge";

const config = new Configuration({
  apiKey: "******",
  baseOptions: {
    headers: {
      "api-key": "*****",
    },
  },
  basePath: `*******`,
  defaultQueryParams: new URLSearchParams({
    "api-version": "2023-07-01-preview",
  }),
});
export const openai = new OpenAIApi(config);

export const summariseCode = async (code: string, filename: string) => {
  let completion = "";
  console.log("summarising", filename);
  //   return "";
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-35-turbo-16k",
      messages: [
        {
          role: "system",
          content: `You are an intelligent senior software engineer who specialise in onboarding junior software engineers onto projects`,
        },
        {
          role: "user",
          content: `You are onboarding a junior software engineer and explaining to them the purpose of the ${filename} file
        here is the code:
        ---
        ${code}
        ---
        give a summary no more than 100 words of the code above
        `,
        },
      ],
    });

    const data =
      (await response.json()) as ResponseTypes["createChatCompletion"];
    completion = data.choices[0]?.message?.content!;
  } catch (error) {
    console.error(error);
  }
  return completion;
};
