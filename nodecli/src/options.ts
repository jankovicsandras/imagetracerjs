
export interface Options {
 /**
   * Path or glob file pattern to .png files, relative to current dir.
   */
  input: string | Buffer

  /**
   * Folder for output files. If it doesn't exists it will be created. If none, output files will be written in current folder.
   */
  output?: string

    /**
    *  Print usage information, then exit.
    */
   help?: boolean

  //    /**
  //  *  Prints debug messages. 
  //  */
  // debug?: boolean

  /**
   * output file format. Currently only png is supported
   */
  format?: 'png'

}
