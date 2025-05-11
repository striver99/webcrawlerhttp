import { describe, it, expect } from 'vitest';

import { normalizeURL, getURLsFromHTML } from './crawl';

describe('normalize function', () => {
  it('should strip protocol', () => {
    const input = 'https://blog.boot.dev/path';
    const actual = normalizeURL(input);
    const expected = 'blog.boot.dev/path';

    expect(actual).toEqual(expected);
  });

  it('should check correctly trailing slashes', () => {
    const input = 'https://blog.boot.dev/path/';
    const actual = normalizeURL(input);
    const expected = 'blog.boot.dev/path';

    expect(actual).toEqual(expected);
  });

  it('should check capitals', () => {
    const input = 'https://BLOG.boot.dev/path';
    const actual = normalizeURL(input);
    const expected = 'blog.boot.dev/path';

    expect(actual).toEqual(expected);
  });

  it('should check without protocol http:', () => {
    const input = 'http://BLOG.boot.dev/path';
    const actual = normalizeURL(input);
    const expected = 'blog.boot.dev/path';

    expect(actual).toEqual(expected);
  });
});

describe('getURLsFromHTML function', () => {
  it('should find absolute URLs', () => {
    const inputHTMLBody = `
    <html>
  <body>
    <a href="https://blog.boot.dev/path/"><span>Go to Boot.dev</span></a>
  </body>
</html>
    `;
    const inputBaseURL = 'https://blog.boot.dev/path/';
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
    const expected = ['https://blog.boot.dev/path/'];

    expect(actual).toEqual(expected);
  });

  it('should find relative URLs', () => {
    const inputHTMLBody = `
    <html>
  <body>
  <a href="/path2/"><span>Go to Boot.dev2</span></a>
  </body>
</html>
    `;
    const inputBaseURL = 'https://blog.boot.dev';
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
    const expected = ['https://blog.boot.dev/path2/'];

    expect(actual).toEqual(expected);
  });

  it('should find relative URLs AND absolute URLs on the page', () => {
    const inputHTMLBody = `
    <html>
  <body>
  <a href="https://blog.boot.dev/path1/"><span>Go to Boot.dev</span></a>
    <a href="/path2/"><span>Go to Boot.dev2</span></a>
  </body>
</html>
    `;
    const inputBaseURL = 'https://blog.boot.dev';
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
    const expected = [
      'https://blog.boot.dev/path1/',
      'https://blog.boot.dev/path2/',
    ];

    expect(actual).toEqual(expected);
  });

  it('should not add invalid URLs', () => {
    const inputHTMLBody = `
    <html>
  <body>
    <a href="invalid"><span>Go to Boot.dev</span></a>
  </body>
</html>
    `;
    const inputBaseURL = 'https://blog.boot.dev/path/';
    const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
    const expected: [] = [];

    expect(actual).toEqual(expected);
  });
});
