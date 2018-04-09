import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  branchAndMerge,
  mergeWith,
  apply,
  url,
  template,
  SchematicsException,
  filter,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

import { DockerSchema } from './schema.model';
import { getPackageName } from '../utils/npm';
import { getDockerReadMeText } from './data';

export default function(options: DockerSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    options.name = getPackageName(tree);

    if (tree.exists('/Dockerfile')) {
      throw new SchematicsException('Dockfile already exists');
    }

    if (!options.universal && (!options.domain || !options.domain.length)) {
      throw new SchematicsException('Must specify a domain name for nginx config');
    }

    const nginxFilter = filter((path) => options.universal ? !path.endsWith('nginx.conf') : true);

    const templateSource = apply(url('./files'), [
      nginxFilter,
      template({
        ...strings,
        ...options,
      })
    ]);

    return chain([
      branchAndMerge(chain([
        mergeWith(templateSource),
        updateReadme(options)
      ])),
    ])(tree, context);
  };
}

function updateReadme(options: DockerSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const readMeFile = 'README.md';
    const buffer = tree.read(readMeFile);
    let content: string = '';

    if (buffer) {
      content = buffer.toString();
    }

    content += getDockerReadMeText(options.name);

    tree.overwrite(readMeFile, content);

    return tree;
  }
}


