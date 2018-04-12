export const universalReadMeText = `
## Server side rendering

The app can be rendered on a server before serving pages to the client. Server side rendering is achieved using [Express](https://expressjs.com/) and [Angular Universal](https://github.com/angular/universal) with [Express](https://expressjs.com/) running a [node](https://nodejs.org/en/) web server and [@nguniversal/express-engine](https://github.com/angular/universal/tree/master/modules/express-engine) providing a template engine for [Express][express] to render the angular pages.

Run \`npm run build:ssr && npm run serve:ssr\` to build client and server bundles and run an express app which will render the angular templates before being sent to the client. Navigate to \`http://localhost:4000/\` to view the SSR version of the app.
`;
