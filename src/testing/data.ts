export const karmaPluginsFind = `plugins: [`;
export const karmaPluginsReplace = `plugins: [
      require('karma-spec-reporter'),`;

export const karmaCoverageFind = `reports: [ 'html', 'lcovonly' ]`;
export const karmaCoverageReplace = `reports: [ 'html', 'lcovonly', 'text-summary' ]`;

export const karmaReportersFind = `reporters: ['progress', 'kjhtml'],`;
export const karmaReportersReplace = `reporters: config.angularCli && config.angularCli.codeCoverage ?
        ['spec', 'kjhtml', 'coverage-istanbul'] :
        ['spec', 'kjhtml'],`;

export const karmaCustomLaunchFind = `browsers: ['Chrome'],`;
export const karmaCustomLaunchReplace = `browsers: ['Chrome'],
    customLaunchers: {
      ChromeNoSandbox: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },`;

export const protractorCapFind = `'browserName': 'chrome'`;
export const protractorCapReplace = `browserName: 'chrome',
    chromeOptions: {
      args: ['--no-sandbox']
    }`;
