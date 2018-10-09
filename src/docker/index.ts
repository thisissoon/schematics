import { strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';

import { getJsonFile } from '../utils/json';
import { getPackageManager, getPackageName } from '../utils/npm';
import { getDockerReadMeText } from './data';
import { DockerSchema } from './schema.model';

export default function(options: DockerSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    options.name = getPackageName(tree);
    const cliJson = getJsonFile('/angular.json', tree);
    const defaultProject = Object.keys(cliJson.projects)[0];
    options.distFolder =
      cliJson.projects[defaultProject].architect.build.options.outputPath;

    options.packageManager = getPackageManager(tree);

    if (tree.exists('/Dockerfile')) {
      throw new SchematicsException('Dockfile already exists');
    }

    if (!options.universal && (!options.domain || !options.domain.length)) {
      throw new SchematicsException(
        'Must specify a domain name for nginx config',
      );
    }

    const templateSource = apply(url('./files'), [
      options.universal ? filter(path => !path.endsWith('nginx.conf')) : noop(),
      template({
        ...strings,
        ...options,
      }),
    ]);

    return chain([
      branchAndMerge(chain([mergeWith(templateSource), updateReadme(options)])),
    ])(tree, context);
  };
}

function updateReadme(options: DockerSchema): Rule {
  return (tree: Tree) => {
    const readMeFile = 'README.md';
    const buffer = tree.read(readMeFile);
    let content: string = '';

    if (buffer) {
      content = buffer.toString();
    }

    content += getDockerReadMeText(options.name);

    tree.overwrite(readMeFile, content);

    return tree;
  };
}
