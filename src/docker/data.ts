export function getDockerReadMeText(name: string) {
 return `
## Docker

To build a image locally run:

\`\`\`
npm run build:ssr && docker build -t ${name}:latest .
\`\`\`

To run the docker image run:

\`\`\`
docker run -d -p 4000:4000 ${name}:latest
\`\`\`
`;
}
