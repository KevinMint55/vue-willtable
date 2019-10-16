process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const chalk = require('chalk');
const ora = require('ora');
const buildWebpackConfig = require('./webpack.prod.conf');

(() => {
  const spinner = ora('构建中...');
  spinner.start();

  webpack(buildWebpackConfig, (err, status) => {
    spinner.stop();
    if (err) throw err;
    process.stdout.write(`${status.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
    })}\n\n`);

    if (status.hasErrors()) {
      console.log(chalk.red('  构建出错！！！\n'));
      process.exit(1);
    }

    console.log(chalk.cyan('  构建成功！！！\n'));
    console.log(chalk.yellow(
      '  Tip: 构建的文件需要通过HTTP服务启动.\n'
      + '  直接打开 index.html 在 file:// 没有作用.\n',
    ));
    process.exit();
  });
})();
