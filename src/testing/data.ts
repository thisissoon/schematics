export const karmaPluginsFind = `plugins: [`;
export const karmaPluginsReplace = `plugins: [
      require('karma-mocha-reporter'),`;

export const karmaCoverageFind = `reports: ['html', 'lcovonly'],`;
export const karmaCoverageReplace = `reports: ['html', 'lcovonly', 'text-summary'],`;

export const karmaReportersFind = `reporters: ['progress', 'kjhtml'],`;
export const karmaReportersReplace = `reporters: config.angularCli && config.angularCli.codeCoverage ?
        ['mocha', 'kjhtml', 'coverage-istanbul'] :
        ['mocha', 'kjhtml'],`;

export const karmaCustomLaunchFind = `browsers: ['Chrome'],`;
export const karmaCustomLaunchReplace = `browsers: ['ChromeHeadless'],`;

export const protractorCapFind = `'browserName': 'chrome'`;
export const protractorCapReplace = `browserName: 'chrome',
    chromeOptions: {
      args: ['--headless', '--no-sandbox']
    }`;
