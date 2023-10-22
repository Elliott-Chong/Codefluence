import Resolver from "@forge/resolver";
import api, { route, fetch, storage } from "@forge/api";

const resolver = new Resolver();

const createPage = async (spaceId, title, body) => {
  var bodyData = {
    spaceId: spaceId,
    status: "current",
    title: title,
    body: {
      representation: "storage",
      value: body,
    },
  };

  try {
    const response = await api
      .asUser()
      .requestConfluence(route`/wiki/api/v2/pages`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

    console.log(`Response: ${response.status} ${response.statusText}`);
    console.log(await response.json());
  } catch (error) {
    throw error;
  }
};

resolver.define("getSpaceId", async (req) => {
  const { context } = req;
  const pageId = context.extension.content.id;
  const response = await api
    .asUser()
    .requestConfluence(route`/wiki/api/v2/pages/${pageId}`, {
      headers: {
        Accept: "application/json",
      },
    });
  const data = await response.json();
  const { spaceId } = data;
  console.log({ spaceId });
  return spaceId;
});

const createOrAppendPage = async (spaceId, title, body) => {
  try {
    const response = await api
      .asUser()
      .requestConfluence(
        route`/wiki/api/v2/spaces/${spaceId}/pages?body-format=storage`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

    const { results } = await response.json();
    const foundPage = results.find((page) => page.title === title);
    if (!foundPage) {
      // no page found
      await createPage(spaceId, title, body);
    } else {
      // page found
      console.log("page found", foundPage);
      const newBody = foundPage.body.storage.value + body;
      console.log("new body", newBody);
      var bodyData = {
        id: foundPage.id,
        status: "current",
        title,
        body: {
          representation: "storage",
          value: newBody,
        },
        version: {
          number: foundPage.version.number + 1,
          message: "qna",
        },
      };

      const response = await api
        .asUser()
        .requestConfluence(route`/wiki/api/v2/pages/${foundPage.id}`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        });
      console.log(`Response: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log("eelle", error);
  }
};

resolver.define("getGithubUrl", async (req) => {
  const { spaceId } = req.payload;
  const githubUrl = await storage.get(`space-${spaceId}`);
  console.log({ githubUrl });
  if (typeof githubUrl === "object") {
    if (Object.keys(obj).length === 0) {
      console.log("No github url found");
      return false;
    }
  }
  console.log({ githubUrl });
  return githubUrl;
});

resolver.define("setGithubUrl", async (req) => {
  const { spaceId, githubUrl } = req.payload;
  await storage.set(`space-${spaceId}`, githubUrl);
});

resolver.define("ask", async (req) => {
  const { question, spaceId } = req.payload;
  const result = await fetch(`https://codegeist.reluvate.tech/api/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      spaceId,
    }),
  });
  const data = await result.json();
  const { answer } = data;
  await createOrAppendPage(
    spaceId,
    "Codebase FAQ",
    `<h3>${question}</h3> \n<p>${answer}</p> \n\n`
  );
  return answer;
});

resolver.define("generateDocumentation", async (req) => {
  const { githubUrl, spaceId } = req.payload;
  const result = await fetch(
    `https://codegeist.reluvate.tech/api/generate-docs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        githubUrl: githubUrl,
        spaceId,
      }),
    }
  );
  const data = await result.json();
  const { documentation } = data;
  return documentation;
});

resolver.define("createDocumentation", async (req) => {
  const { spaceId, documentation } = req.payload;
  await createPage(spaceId, "Documentation", documentation);
  return true;
});

export const handler = resolver.getDefinitions();
