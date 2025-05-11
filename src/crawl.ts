import { JSDOM } from 'jsdom';

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const urls: string[] = [];
  const dom = new JSDOM(html);
  const linkElements = dom.window.document.querySelectorAll('a');

  for (const linkElement of linkElements) {
    if (linkElement.href.slice(0, 1) === '/') {
      try {
        const urlObj = new URL(`${baseURL}${linkElement.href}`);
        urls.push(urlObj.href);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.log(`error with relative url: ${err.message}`);
        }
      }
    } else {
      try {
        const urlObj = new URL(linkElement.href);
        urls.push(urlObj.href);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.log(`error with absolute url: ${err.message}`);
        }
      }
    }
  }

  return urls;
}

export function normalizeURL(urlString: string) {
  const urlObj = new URL(urlString);

  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;

  if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
    return hostPath.slice(0, -1);
  }

  return hostPath;
}

// use default args to prime the first call
export async function crawlPage(
    baseURL: string,
    currentURL: string = baseURL,
    pages: Record<string, number> = {},
  ) {
    // if this is an offsite URL, bail immediately
    const currentURLObj = new URL(currentURL);
    const baseURLObj = new URL(baseURL);
    if (currentURLObj.hostname !== baseURLObj.hostname) {
      return pages;
    }

    // use a consistent URL format
    const normalizedURL = normalizeURL(currentURL);

    // if we've already visited this page
    // just increase the count and don't repeat
    // the http request
    if (pages[normalizedURL] > 0) {
      pages[normalizedURL]++;
      return pages;
    }

    // initialize this page in the map
    // since it doesn't exist yet
    pages[normalizedURL] = 1;

    // fetch and parse the html of the currentURL
    console.log(`crawling ${currentURL}`);
    let html = "";
    try {
      html = await getHTML(currentURL);
    } catch (err) {
      console.log(`${(err as Error).message}`);
      return pages;
    }

    // recur through the page's links
    const nextURLs = getURLsFromHTML(html, baseURL);
    for (const nextURL of nextURLs) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }

    return pages;
  }

  async function getHTML(url: string) {
    let res;
    try {
      res = await fetch(url);
    } catch (err) {
      throw new Error(`Got Network error: ${(err as Error).message}`);
    }

    if (res.status > 399) {
      throw new Error(`Got HTTP error: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      throw new Error(`Got non-HTML response: ${contentType}`);
    }

    return res.text();
  }

