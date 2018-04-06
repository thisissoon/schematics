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
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

import { DockerSchema } from './schema.model';

export default function(options: DockerSchema): Rule {
  // console.log(JSON.stringify(options, null, 2));

  return (tree: Tree, context: SchematicContext) => {

    const templateSource = apply(url('./files'), [
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


