import {
  branchAndMerge,
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { getJsonFile } from '../utils/json';
import { addNPMInstallTask } from '../utils/npm';
import { commitReadMeText } from './data';

export default function(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    addNPMInstallTask(context);

    return chain([
      branchAndMerge(chain([updatePackageJson(), updateReadme()])),
    ])(tree, context);
  };
}

function updatePackageJson(): Rule {
  return (tree: Tree) => {
    const pkgJsonPath = '/package.json';
    const defaultObj = { scripts: {}, dependencies: {} };
    const pkgJson = getJsonFile(pkgJsonPath, tree, defaultObj);

    pkgJson.devDependencies['cz-conventional-changelog'] = '^2.1.0';
    pkgJson.devDependencies['standard-version'] = '^4.3.0';
    pkgJson.scripts.release = 'standard-version';
    pkgJson.config = {
      commitizen: {
        path: './node_modules/cz-conventional-changelog',
      },
    };

    tree.overwrite(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
  };
}

function updateReadme(): Rule {
  return (tree: Tree) => {
    const readMeFile = 'README.md';
    const buffer = tree.read(readMeFile);
    let content: string = '';

    if (buffer) {
      content = buffer.toString();
    }

    content += commitReadMeText;

    tree.overwrite(readMeFile, content);

    return tree;
  };
}
