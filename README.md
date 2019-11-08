# bouncing-balls
The one true task

## Usage
Open index.html in the dist folder in your favourite browser.
Alternatively serve the html file with a http server i.e (nginx, node + express, etc.)

## Limitations
For performance reasons the number of collisions (per ball movement) is limited to 20.

Disclamer: This software is made for presentation purposes only.
**_DO NOT_** use for real world bouncy balls modelling as it will not accurately represent ball movements at large numbers (n >= 1).

## Build
Requires [webpack](https://webpack.js.org/guides/typescript/#basic-setup). In the root directory run: 
```
npx webpack
```
and it should 'compile' all the *.ts files to bundle.js
## Run tests
```
ts-mocha *.spec.ts
```
**Note:** draw.spec.ts requires [jsdom](https://github.com/jsdom/jsdom) (and its dependencies) to run correctly.

## Tools
     Node.js
     Typescript
     Webpack (for Typescript)
     Mocha + Chai for testing

## License
[MIT License](https://opensource.org/licenses/MIT)