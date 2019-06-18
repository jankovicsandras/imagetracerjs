import PNGReader from 'png.js'

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

type PNG = PNGReader['png']

export function readPng(content: Buffer): Promise<PNG> {
  return new Promise((resolve, reject) => {
    return new PNGReader(content).parse((error, png) => {
      if (error) {
        reject(error)
      } else {
        resolve(png)
      }
    })
  })
}