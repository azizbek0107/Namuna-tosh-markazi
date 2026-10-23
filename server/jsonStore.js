import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';

export function fileJsonStore(directory) {
  return {
    read(name, fallback) {
      const file = resolve(directory, name + '.json');
      return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback;
    },
    write(name, value) {
      const file = resolve(directory, name + '.json');
      mkdirSync(directory, { recursive: true });
      writeFileSync(file + '.tmp', JSON.stringify(value), { mode: 0o600 });
      renameSync(file + '.tmp', file);
    },
  };
}

export function snapshotJsonStore(documents) {
  return {
    read: (name, fallback) => structuredClone(documents[name] ?? fallback),
    write: (name, value) => { documents[name] = structuredClone(value); },
  };
}
