export interface TestingSchema {
  ci: 'circle' | 'travis' | 'gitlab';
  name: string;
}
