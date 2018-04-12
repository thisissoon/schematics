export const commitReadMeText = `
## Making Commits

This repo uses [Commitizen CLI](http://commitizen.github.io/cz-cli/) and [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog) to create commits and generate changelogs. Instead of running \`git commit\` run \`git cz\` and follow the prompts. Changelogs will then be generated when creating new releases by running \`npm run release\`.

## Making Releases

Run \`npm run release\` to create a new release. This will use [Standard Version](https://github.com/conventional-changelog/standard-version) to create a new release. [Standard Version](https://github.com/conventional-changelog/standard-version) will generate / update the changelog based on commits generated using [Commitizen CLI](http://commitizen.github.io/cz-cli/), update the version number following semantic versioning rules and then commit and tag the commit for the release. Simply run \`git push --follow-tags origin master\`.
`;
