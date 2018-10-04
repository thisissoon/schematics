export interface TestingSchema {
  ci: 'circle' | 'travis' | 'gitlab';
  name: string;
  packageManager?: 'npm' | 'yarn';
}
