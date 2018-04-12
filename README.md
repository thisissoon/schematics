# SOON_ Schematics

A set of extensions for the Angular CLI.

## Install

### via NPM

```bash
npm i @thisissoon/schematics --save-dev
```

### via Yarn

```bash
yarn add @thisissoon/schematics --dev
```


## Schematics

### Testing schematic
A schematic to set up CI and testing patterns

```bash
ng g @thisissoon/schematics:testing --ci travis
```
#### Options:
* ci (`string`): name of CI service to use. One of  `travis` | `circle` | `gitlab` (default: `travis`)


### Universal Express schematic
A schematic to set up angular universal with express.js

```bash
ng g @thisissoon/schematics:universal-express
```


### Docker schematic
A schematic that generates a `DOCKERFILE` to build a docker image

```bash
ng g @thisissoon/schematics:docker
```
#### Options:
* universal (`boolean`): Set to true if using a server side rendered app (default: `false`)
* domain (`string`): Example: `thisissoon.com` Required if `universal` option is set to `false`.


### License schematic
A schematic to generate a MIT license file

```bash
ng g @thisissoon/schematics:license --name SOON_
```
#### Options:
* name (`string`): Name of license holder e.g. `SOON_`


### Commits schematic
A schematic to setup conventional commits and changelog generation

```bash
ng g @thisissoon/schematics:commits
```


### Linting schematic
A schematic to set up and police code formatting rules

```bash
ng g @thisissoon/schematics:linting
```


## Development

### Testing

To test locally, install `@angular-devkit/schematics` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with
```bash
schematics --help
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!
