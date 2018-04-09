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
        mergeWith(templateSource)
      ])),
    ])(tree, context);
  };
}


