import { Tree, SchematicContext } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { getJsonFile } from './json';

export function getPackageName(tree: Tree): string {
  const pkgJsonPath = '/package.json';
  const defaultObj = { name: 'app' };
  const pkgJson = getJsonFile(pkgJsonPath, tree, defaultObj)
  return pkgJson.name;
}

export function addNPMInstallTask(context: SchematicContext) {
  context.addTask(new NodePackageInstallTask());
}
