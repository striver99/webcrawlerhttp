import { crawlPage } from './crawl';
import { printReport } from './report';


async function main() {
  if (process.argv.length < 3) {
    console.log('no website provided');
    process.exit(1);
  }
  if (process.argv.length > 3) {
    console.log('too many arguments provided');
    process.exit(1);
  }
  const baseURL = process.argv[2];

  console.log(`starting crawl of: ${baseURL}...`);

  const pages = await crawlPage(baseURL);

  printReport(pages, baseURL);

  process.exit(0);
}

main();
