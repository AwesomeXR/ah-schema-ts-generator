import * as Path from 'path';
import * as fs from 'fs';

// copy from https://github.com/typeorm/typeorm/blob/master/src/util/ImportUtils.ts
export async function importOrRequireFile(filePath: string): Promise<[result: any, moduleType: 'esm' | 'commonjs']> {
  const tryToImport = async (): Promise<[any, 'esm']> => {
    // `Function` is required to make sure the `import` statement wil stay `import` after
    // transpilation and won't be converted to `require`
    return [await Function('return filePath => import(filePath)')()(filePath), 'esm'];
  };

  const tryToRequire = async (): Promise<[any, 'commonjs']> => {
    return [require(filePath), 'commonjs'];
  };

  const extension = filePath.substring(filePath.lastIndexOf('.') + '.'.length);

  if (extension === 'mjs' || extension === 'mts') return tryToImport();
  else if (extension === 'cjs' || extension === 'cts') return tryToRequire();
  else if (extension === 'js' || extension === 'ts') {
    const packageJson = await getNearestPackageJson(filePath);

    if (packageJson != null) {
      const isModule = (packageJson as any)?.type === 'module';

      if (isModule) return tryToImport();
      return tryToRequire();
    }

    return tryToRequire();
  }

  return tryToRequire();
}

function getNearestPackageJson(filePath: string): Promise<object | null> {
  return new Promise(accept => {
    let currentPath = filePath;

    function searchPackageJson() {
      const nextPath = Path.dirname(currentPath);

      if (currentPath === nextPath)
        // the top of the file tree is reached
        accept(null);
      else {
        currentPath = nextPath;
        const potentialPackageJson = Path.join(currentPath, 'package.json');

        fs.stat(potentialPackageJson, (err, stats) => {
          if (err != null) searchPackageJson();
          else if (stats.isFile()) {
            fs.readFile(potentialPackageJson, 'utf8', (_err, data) => {
              if (_err != null) accept(null);
              else {
                try {
                  accept(JSON.parse(data));
                } catch (_err2) {
                  accept(null);
                }
              }
            });
          } else searchPackageJson();
        });
      }
    }

    searchPackageJson();
  });
}
