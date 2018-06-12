import { Tree } from '@angular-devkit/schematics';


export function getJsonFile(path: string, tree: Tree, defaultObj: any = {}) {
  let json;
  const buffer = tree.read(path);

  if (buffer === null) {
    json = defaultObj;
  } else {
    json = JSON.parse(buffer.toString());
  }

  return json;
}
