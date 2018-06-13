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

import * as data from './data';
import { TestingSchema } from './schema.model';
import { getPackageName, addNPMInstallTask } from '../utils/npm';
import { getJsonFile } from '../utils/json';

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
        updatePackageJson(),
        updateAngularJson()
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

function updatePackageJson(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const pkgJsonPath = '/package.json';
    const defaultObj = { scripts: {}, dependencies: {} };
    const pkgJson = getJsonFile(pkgJsonPath, tree, defaultObj);

    pkgJson.devDependencies['karma-mocha-reporter'] = '^2.2.5';
    pkgJson.devDependencies['coveralls'] = '^3.0.0';
    pkgJson.scripts['test:ci'] = 'npm test -- --configuration ci';
    pkgJson.scripts['coverage'] = 'coveralls < coverage/lcov.info';

    tree.overwrite(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
  }
}

function updateAngularJson(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const angularCliConfigPath = '/angular.json';
    let cliJson = getJsonFile(angularCliConfigPath, tree);
    const appNames = Object.keys(cliJson.projects).map(key => key);

    appNames.forEach(name => {
      if (cliJson.projects[name].architect.test) {
        cliJson.projects[name].architect.test['configurations'] = {
          ci: {
            codeCoverage: true,
            progress: false,
            browsers: 'ChromeNoSandbox',
            watch: false
          }
        }
        cliJson.projects[name].architect.build.configurations['no-progress'] = { progress: false };
        cliJson.projects[name].architect.serve.configurations['no-progress'] = { browserTarget: `${name}:build:no-progress` };
      }
      if (cliJson.projects[name].architect.e2e) {
        const nonE2Ename = name.replace('-e2e', '');
        cliJson.projects[name].architect.e2e.options.devServerTarget = `${nonE2Ename}:serve:no-progress`;
      }
    });

    tree.overwrite(angularCliConfigPath, JSON.stringify(cliJson, null, 2) + '\n');

  }
}

function updateKarmaConfig(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const karmaPath = '/src/karma.conf.js';
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
    const protractorPath = '/e2e/protractor.conf.js';
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
