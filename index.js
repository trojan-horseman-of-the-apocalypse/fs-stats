const yargs = require('yargs');
const chalk = require('chalk');
const fs = require('fs');
const countFiles = require('count-files');

yargs.command({
  command: 'count-file-chars',
  describe: 'Count the characters of a file in the specified file',
  builder: {
    fileName: {
      describe: 'File name',
      demandOption: true,
      type: 'string',
    },
  },
  handler: (argv) => {
    fs.stat(`./${argv.fileName}`, (err, stats) => {
      if (err) chalk.red(err);
      try {
        if (stats.isDirectory()) {
          console.log(chalk.red(`${argv.fileName} is a directory and not a file!`));
          return;
        }
        if (stats.isFile()) {
          const file = fs.readFileSync(`./${argv.fileName}`);
          const fileString = file.toString();
          const charExclusion = ['\n'];
          const fileChars = fileString.split('').filter((char) => !charExclusion.includes(char));
          const specialChars = fileChars.join('').match(/\W|_/g);
          console.log(chalk.green(`${argv.fileName} contains ${fileChars.length} characters, ${specialChars.length} of which are special!`));
          return;
        }
      } catch (e) {
        console.log(chalk.red('The file you are trying to evaluate doesn\'t seem to exist. Please try again!'));
      }
    });
  },
});

yargs.command({
  command: 'count-dir-files',
  describe: 'Count the files within a specified directory',
  builder: {
    dirName: {
      describe: 'Directory name',
      demandOption: true,
      type: 'string',
    },
  },
  handler: (argv) => {
    fs.stat(`${argv.dirName}`, (err, stats) => {
      if (err) chalk.red(err);
      try {
        if (stats.isDirectory()) {
          const details = {};
          countFiles(argv.dirName, (error, results) => {
            if (error) throw error;
            Object.entries(results).reduce((acc, el) => {
              const [stat, val] = el;
              details[stat] = val;
              return el;
            });
            if (!Object.keys(details).includes('files')) {
              fs.readdir(argv.dirName, (e, files) => {
                if (e) throw e;
                details.files = files.length;
              });
            }
            console.log(chalk.green(`the ${argv.dirName} directory has:`));
            console.table(results);
          });
        }
        if (stats.isFile()) {
          console.log(chalk.red(`${argv.dirName} is a ${argv.dirName.split('.')[1]} file and not a directory!`));
          return;
        }
      } catch (e) {
        console.log(chalk.red('The file you are trying to evaluate doesn\'t seem to exist. Please try again!'));
      }
    });
  },
});

yargs.parse();
