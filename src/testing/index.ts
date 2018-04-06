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
  filter
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import * as data from './data';
import { TestingSchema } from './schema.model';

export default function(options: TestingSchema): Rule {

  return (tree: Tree, context: SchematicContext) => {
    options.name = getPackageName(tree);

    const templateSource = apply(url('./files'), [
      filterConfig(options),
      template({
        ...strings,
        ...options,
      })
    ]);

    addNPMInstallTask(context);

    return chain([
      branchAndMerge(chain([
        mergeWith(templateSource),
        updateKarmaConfig(),
        updateProtractorConfig(),
        updatePackageJson()
      ])),
    ])(tree, context);
  };
}

function filterConfig(options: TestingSchema): Rule {
  const travisFilter = filter(path => !path.endsWith('.circleci/config.yml') && !path.endsWith('.gitlab-ci.yml'));
  const circleFilter = filter(path => !path.endsWith('.travis.yml') && !path.endsWith('.gitlab-ci.yml'));
  const gitlabFilter = filter(path => !path.endsWith('.travis.yml') && !path.endsWith('.circleci/config.yml'));

  let filterToApply: Rule;

  switch (options.ci) {
    case 'circle':
      filterToApply = circleFilter
      break;
    case 'travis':
      filterToApply = travisFilter
      break;
    case 'gitlab':
      filterToApply = gitlabFilter
      break;
    default:
      filterToApply = travisFilter
      break;
  }

  return filterToApply;
}

function getPackageName(tree: Tree): string {
  const buffer = tree.read('/package.json');
  let name: string;
  if (buffer === null) {
    name = 'app';
  } else {
    name = JSON.parse(buffer.toString()).name;
  }
  return name;
}

function updatePackageJson(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const pkgJsonPath = '/package.json';
    const buffer = tree.read(pkgJsonPath);
    let pkgJson;
    if (buffer === null) {
      pkgJson = { devDependencies: {} };
    } else {
      pkgJson = JSON.parse(buffer.toString());
    }
    pkgJson.devDependencies['karma-spec-reporter'] = '0.0.32';

    tree.overwrite(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  }
}

function updateKarmaConfig(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const karmaPath = '/karma.conf.js';
    const buffer = tree.read(karmaPath);
    if (buffer === null) {
      return;
    }

    let sourceText = buffer.toString();

    sourceText = sourceText
      .split(data.karmaPluginsFind)
      .join(data.karmaPluginsReplace)
      .split(data.karmaCoverageFind)
      .join(data.karmaCoverageReplace)
      .split(data.karmaReportersFind)
      .join(data.karmaReportersReplace)
      .split(data.karmaCustomLaunchFind)
      .join(data.karmaCustomLaunchReplace);

    tree.overwrite(karmaPath, sourceText);
  }
}

function updateProtractorConfig(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const protractorPath = '/protractor.conf.js';
    const buffer = tree.read(protractorPath);
    if (buffer === null) {
      return;
    }

    let sourceText = buffer.toString();

    sourceText = sourceText
      .split(data.protractorCapFind)
      .join(data.protractorCapReplace);

    tree.overwrite(protractorPath, sourceText);
  }
}

function addNPMInstallTask(context: SchematicContext) {
  context.addTask(new NodePackageInstallTask());
}
