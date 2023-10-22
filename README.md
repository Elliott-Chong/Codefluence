## Inspiration
We were inspired to create CodeFluence by the frustration of manually creating documentation for our GitHub projects. We recognized the need for a tool that could automate this process and make our lives as developers easier. 

We also noticed that the onboarding process for new developers onto project was very inefficient. New contributors often need to keep asking more seasoned developers for details of the code.

With the above 2 pain points, we thought to ourselves, why not use the power of LLMs and AI to aid in the process?

## What it does
CodeFluence is a platform that streamlines the documentation generation process for GitHub projects. It automates the creation of project documentation by analyzing the project's codebase, identifying key components, and generating informative content. Users can simply provide a link to their GitHub project, and CodeFluence handles the rest, producing comprehensive documentation.

Users can then ask any question regarding the code base and the AI will use Retrieval Augmented Generation ( RAG ) to answer the question accurately with context of the codebase.

**Example**: 
User: "Which file contains the logic for the authentication of users?"
AI: "The logic that handles the authentication of new users lies in the src/server/trpc/auth.ts file. The authentication form UI is in the src/components/RegisterForm.tsx file"

## How we built it
[See how I built the app!](https://youtu.be/GkILyVkQNmU)
CodeFluence is built using a combination of technologies and services:
- **Frontend**: The frontend is developed using a custom UI created with Atlassian Forge. It provides an intuitive user interface for users to submit their GitHub project links and initiate the documentation generation process.
- **Backend**: The backend leverages Confluence REST APIs to interact with Confluence for documentation storage. It also utilizes Langchain, OpenAI, and Pinecone DB for AI-powered analysis and content generation. The backend is hosted on a Next.js project, running within a Docker instance on Digital Ocean, ensuring reliability and scalability.

The FaaS service by Atlassian Forge also acts as the API proxy to our AI backend that handles all the incoming requests.

## Challenges we ran into
During the development of CodeFluence, we encountered several challenges, including:
- **AI Integration**: Integrating multiple AI services, such as Langchain, PineconeDB and OpenAI, while ensuring seamless communication between them required significant effort.
- **Atlassian Forge Functions Timeout**: Our AI backend sometimes take longer than 25 seconds to process a large GitHub project, and so the Atlassian Forge function times out and stops the process from finishing.
- **User Experience**: Creating an intuitive and user-friendly interface to make the documentation generation process effortless for users was a complex task.

## Accomplishments that we're proud of
We're proud of several key accomplishments:
- **Fully Automated Documentation**: CodeFluence successfully automates the entire documentation generation process, reducing the manual effort required for documentation creation.
- **AI Integration**: We've effectively integrated advanced AI technologies to analyze GitHub projects and generate high-quality documentation.
- **Retrieval Augmented Generation**: We successfully integrated OpenAI embeddings and PineconeDB to provide a reliable AI experience for the users.
- **Scalable Infrastructure**: Our hosting solution on Digital Ocean allows for scalability and reliable performance.
- **Positive User Feedback**: We've received positive feedback from users who have found value in using CodeFluence to improve their documentation processes.

## What we learned
Developing CodeFluence taught us valuable lessons:
- **AI Integration**: We gained deep insights into integrating AI services and ensuring they work harmoniously.
- **User-Centered Design**: Prioritizing user experience and creating an intuitive UI is essential for user adoption.
- **Scalability**: We learned the importance of building a scalable infrastructure to handle varying levels of demand.

## What's next for CodeFluence
The future of CodeFluence looks promising:
- **Enhanced AI Capabilities**: We plan to further enhance the AI backend, making it even more proficient at understanding and documenting complex code.
- **Integration with More Platforms**: We aim to expand beyond GitHub and integrate with other code repository platforms such as BitBucket.
- **Customization**: Providing users with options to customize the generated documentation to meet their specific needs.
- **Community and Collaboration Features**: Building features that facilitate collaboration and knowledge sharing among development teams.
- **Performance and Scaling**: Continuously improving performance and scalability to handle a growing user base.

CodeFluence is poised to become an indispensable tool for developers, streamlining the documentation process and saving valuable time and effort.
