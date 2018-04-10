import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  branchAndMerge,
  mergeWith,
  apply,
  url,
  template
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { LicenseSchema } from './schema.model';

export default function(options: LicenseSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    options.year = new Date().getFullYear();

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...options,
      })
    ]);

    return chain([
      branchAndMerge(chain([
        mergeWith(templateSource),
      ])),
    ])(tree, context);
  };
}
