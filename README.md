# SOON_ Schematics

A set of extensions for the Angular CLI.

## Install

### via NPM

`npm i @thisissoon/schematics --save-dev`

### via Yarn

`yarn add @thisissoon/schematics --dev`

## Usage

### Testing schematics

#### Example

`ng g @thisissoon/schematics:testing --ci=travis`

#### Options

##### `ci`: string
default(`travis`)

One of:

  * `travis`
  * `circle`
  * `gitlab`

### Docker schematics

#### Example

`ng g @thisissoon/schematics:docker`

#### Options

##### `universal`: boolean
default(`false`)

Set to true if using a server side rendered app

##### `domain`: string
Required if `universal` option is set to `false`


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
