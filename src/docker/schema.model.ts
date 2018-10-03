export interface DockerSchema {
  universal: boolean;
  domain?: string;
  name: string;
  distFolder?: string;
  packageManager?: 'npm' | 'yarn';
}
