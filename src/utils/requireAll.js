import fs from 'fs-extra';

export default function requireAll(options) {
  const DEFAULT_EXCLUDE_DIR = /^\./;
  const DEFAULT_FILTER = /^([^\.].*)\.js(on)?$/;
  const DEFAULT_RECURSIVE = true;

  const dirname = typeof options === 'string' ? options : options.dirname;
  const excludeDirs = options.excludeDirs === undefined ? DEFAULT_EXCLUDE_DIR : options.excludeDirs;
  const filter = options.filter === undefined ? DEFAULT_FILTER : options.filter;
  const recursive = options.recursive === undefined ? DEFAULT_RECURSIVE : options.recursive;
  const resolve = options.resolve || identity;

  let modules = {};
  let map = options.map || identity;

  function excludeDirectory(dirname) {
    return !recursive ||
      (excludeDirs && dirname.match(excludeDirs));
  }

  const files = fs.readdirSync(dirname);

  files.forEach(file => {
    const filepath = `${dirname}/${file}`;
    if (fs.statSync(filepath).isDirectory()) {

      if (excludeDirectory(file)) return;

      modules[map(file, filepath)] = requireAll({
        dirname: filepath,
        filter: filter,
        excludeDirs: excludeDirs,
        map: map,
        resolve: resolve
      });

    } else {
      const match = file.match(filter);
      if (!match) return;

      modules[map(match[1], filepath)] = resolve(require(filepath));
    }
  });

  return modules;
};

function identity(val) {
  return val;
}