console.log("Hello via Bun!");

import * as cheerio from 'cheerio';

const webhookUrl = process.env['DISCORD_WEBHOOK_URL'];
if (webhookUrl === undefined) {
  throw new Error('DISCORD_WEBHOOK_URL is not defined');
}

const chaptersUrl = process.env['CHAPTERS_URL'];
if (chaptersUrl === undefined) {
  throw new Error('CHAPTERS_URL is not defined');
}

const chapterUrlOrigin = process.env['CHAPTER_URL_ORIGIN'];
if (chapterUrlOrigin === undefined) {
  throw new Error('CHAPTER_URL_ORIGIN is not defined');
}

const fetchChapters = await fetch(chaptersUrl);

const chaptersHtml = await fetchChapters.text();

const $ = cheerio.load(chaptersHtml);

const currentChapters = $('a')
  .map((_, element) => $(element).attr('href'))
  .get()
  .filter((href) => href.startsWith('/chapters/'));

const knownChaptersFile = Bun.file('known-chapters.json');

if (knownChaptersFile.size === 0) {
  await Bun.write(knownChaptersFile, JSON.stringify(currentChapters, null, 2));
  process.exit(0);
}

const knownChapters = await knownChaptersFile.json();

const newChapters = currentChapters
  .filter((chapter) => !knownChapters.includes(chapter));

if (newChapters.length === 0) {
  console.log('No new chapters');
  process.exit(0);
}

const chapterUrls = newChapters
  .map((chapter) => chapterUrlOrigin + chapter)
  .join('\n');

const aab = '412263126806036491';
const sayid = '332811201572634624';

const mentionedUsers = [ aab, sayid ];

const mentions = mentionedUsers
  .map((user) => `<@${user}>`)
  .join(' ');

const message = `${mentions}\n${chapterUrls}`;

await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    content: message,
    username: 'Gojo satoru',
    avatar_url: 'https://golden-storage-production.s3.amazonaws.com/topic_images/d7e592b4a8b949a5944acf2ed1a23d95.jpeg',
  })
});

await Bun.write(knownChaptersFile, JSON.stringify(currentChapters, null, 2));
