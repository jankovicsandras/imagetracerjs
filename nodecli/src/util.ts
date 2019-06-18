import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Execute given functions returning promises serially. Returns a promise that resolves when all finish with they results as array.
 */
export function serial<T = any>(p: (() => Promise<T>)[]): Promise<T[]> {
  return new Promise(resolve => {
    p.reduce((promiseChain: any, currentTask: () => Promise<T>) => {
      return promiseChain.then((chainResults: T[]) =>
        currentTask().then(currentResult => [...chainResults, currentResult])
      )
    }, Promise.resolve([])).then((arrayOfResults: T[]) => {
      resolve(arrayOfResults)
    })
  })
}


let packageJsonFolder: string | undefined
export function getPackageJsonFolder(f = __dirname): string | undefined {
  // if (!isNode() && inBrowser()) {
  //   return ''
  // }
  if (!packageJsonFolder) {
    if (existsSync(join(f, 'package.json')) && existsSync(join(f, 'node_modules'))) {
      packageJsonFolder = f
    }
    else {
      const p = join(f, '..')
      if (p && p !== '/') {
        packageJsonFolder = getPackageJsonFolder(p)
      }
    }
  }
  return packageJsonFolder
}
