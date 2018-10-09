import { strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { LicenseSchema } from './schema.model';

export default function(options: LicenseSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    options.year = new Date().getFullYear();

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...options,
      }),
    ]);

    return chain([branchAndMerge(chain([mergeWith(templateSource)]))])(
      tree,
      context,
    );
  };
}
