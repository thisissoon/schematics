import { Tree, SchematicContext } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

export function getPackageName(tree: Tree): string {
  const buffer = tree.read('/package.json');
  let name: string;
  if (buffer === null) {
    name = 'app';
  } else {
    name = JSON.parse(buffer.toString()).name;
  }
  return name;
}

export function addNPMInstallTask(context: SchematicContext) {
  context.addTask(new NodePackageInstallTask());
}
