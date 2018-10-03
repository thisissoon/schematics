import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { LicenseSchema } from './schema.model';


const collectionPath = path.join(__dirname, '../collection.json');

describe('license', () => {
  const runner = new SchematicTestRunner(
    '@thisissoon/schematics',
    collectionPath
  );

  const defaultOptions: LicenseSchema = {
    name: 'Foo',
  };

  let appTree: UnitTestTree;

  beforeEach(() => {
    appTree = runner.runSchematic('license', defaultOptions, appTree);
  });

  it('should generate files', () => {
    const filePath = '/LICENSE';
    const contents = appTree.readContent(filePath);
    const year = new Date().getFullYear();
    expect(appTree.exists(filePath)).toBeTruthy();
    expect(contents).toContain(`Copyright (c) ${year} Foo`);
  });
});
