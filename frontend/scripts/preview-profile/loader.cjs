// Reuse the compiler already installed with Next; no benchmark dependencies.
const { transform } = require('next/dist/build/swc');
module.exports = function loader(source) {
  const done = this.async();
  transform(source, {
    filename: this.resourcePath,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'es6' },
  }).then(result => done(null, result.code), done);
};
