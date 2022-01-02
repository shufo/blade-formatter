import * as webpack from 'webpack';
import CliConfig from './webpack.cli.config';
import MainConfig from './webpack.main.config';

const configurations: Array<webpack.Configuration> = [CliConfig, MainConfig];

export default configurations;
