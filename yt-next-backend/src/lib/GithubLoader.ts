import type { Document } from "langchain/document";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";

export class GithubLoader {
  constructor() {}
  async loadFromURL(url: string): Promise<Document[]> {
    const loader = new GithubRepoLoader(url, {
      branch: "main",
      recursive: true,
      unknown: "warn",
      maxConcurrency: 5, // Defaults to 2
      ignorePaths: [
        "*.lock",
        "*.min.js",
        "*.min.css",
        "*.log",
        "package.lock.json",
        "*.yml",
        "*.toml",
        "*.xml",
        "*.png",
        "*.svg",
        "*.jpg",
        "*.gif",
        "*.zip",
        "*.tar",
        "*.gz",
        "*.pdf",
        "*.csv",
        "*.sql",
        "*.pyc",
        "*.cjs",
        ".gitignore",
      ],
    });
    const docs = await loader.load();
    return docs;
  }
}
