import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';

const access = util.promisify(fs.access);
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);

export async function saftyWriteFile(dir: string, data: string): Promise<void> {
  try {
    await access(dir, fs.constants.F_OK);
    const stats = await stat(dir);
    if (stats.isFile()) {
      await writeFile(dir, data);
    } else {
      throw new Error(dir + " is not a file");
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      try {
        const absPath = path.resolve(dir);
        const filename = path.basename(absPath);
        const dirPath = path.dirname(absPath);
        await mkdir(dirPath, { recursive: true });
        await writeFile(path.join(dirPath, filename), data);
      } catch (e) {
        console.error(e);
      }
    } else {
      console.error(err);
    }
  }
}
