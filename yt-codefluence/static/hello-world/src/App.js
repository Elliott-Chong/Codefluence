import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { invoke } from "@forge/bridge";
import { Toaster, toast } from "sonner";

function App() {
  const [loading, setLoading] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [showAsk, setShowAsk] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  React.useEffect(() => {
    (async () => {
      setWaiting(true);
      const spaceId = await invoke("getSpaceId");
      setSpaceId(spaceId);
      const githubUrl = await invoke("getGithubUrl", {
        spaceId,
      });
      console.log({ githubUrl });
      if (JSON.stringify(githubUrl) != "{}") {
        setShowAsk(true);
        setGithubUrl(githubUrl);
      }
      setWaiting(false);
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const documentation = await invoke("generateDocumentation", {
      githubUrl,
      spaceId,
    });
    console.log({ documentation });
    invoke("createDocumentation", {
      spaceId,
      documentation,
    }).then(async () => {
      await invoke("setGithubUrl", {
        spaceId,
        githubUrl,
      });
      toast.success("Documentation generated!");
      setLoading(false);
      setGithubUrl("");
    });
  };

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    invoke("ask", {
      question,
      spaceId,
    }).then(async (answer) => {
      toast.success("Answer added to the page!");
      setAnswer(answer);
      setLoading(false);
      setQuestion("");
    });
  };

  if (waiting) {
    return <></>;
  }

  return (
    <div className="w-[500px] h-[350px] mt-10">
      <Toaster richColors position="top-center" />
      <h1>CodeFluence</h1>
      {!showAsk && (
        <>
          <p className="mt-1 text-gray-600">
            Enter a url and CodeFluence will generate documentation regarding
            the codebase
          </p>

          <form className="w-full" onSubmit={handleSubmit}>
            <div>
              <input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                type="text"
                id="url"
                name="url"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="https://github.com/username/repo"
                required
              />
              <button
                disabled={loading}
                type="submit"
                className="flex items-center disabled:bg-opacity-30 text-gray-900 mt-2 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                Generate!
                {loading && (
                  <Loader2 className="inline-block ml-2 animate-spin" />
                )}
              </button>
            </div>
          </form>
        </>
      )}
      {showAsk && (
        <>
          <p className="mt-1 text-gray-600">
            Ask any question about the codebase and CodeFluence will generate
            documentation regarding the codebase
            <br />
            <br />
            <a
              href={githubUrl}
              target="_blank"
              className="text-blue-600 underline text-sm"
            >
              {githubUrl}
            </a>
          </p>

          <form className="w-full" onSubmit={handleAskSubmit}>
            <div>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Which file contains the logic for the login page?"
                required
              />
              {answer && <div className="mt-4">Answer: {answer}</div>}
              <button
                disabled={loading}
                type="submit"
                className="flex items-center disabled:bg-opacity-30 text-gray-900 mt-2 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                Ask!
                {loading && (
                  <Loader2 className="inline-block ml-2 animate-spin" />
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
