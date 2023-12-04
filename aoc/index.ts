import axios from 'axios';
import 'dotenv/config';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import path from 'path';
import Turndown from 'turndown';
const session = process.env.SESSION;
const year = process.env.YEAR || new Date().getFullYear();

if (!session) {
  throw new Error('No session cookie specified in .env-file');
}

const client = axios.create({
  baseURL: `https://adventofcode.com/${year}`,
  headers: {
    Cookie: `session=${session}`,
  },
});

/** Get the text input for a specific day using the session specified in your .env-file */
export const getInput = async (day: number) => {
  const cachePath = `./inputs/${year}/${day}.txt`;
  try {
    fs.mkdir(path.parse(cachePath).dir, { recursive: true });
    try {
      return (await fs.readFile(cachePath)).toString();
    } catch (e) {
      const { data } = await client.get(`/day/${day}/input`);
      await fs.writeFile(cachePath, data);
      return data as string;
    }
  } catch (e) {
    throw new Error(`Failed to get input for day ${day}`, { cause: e });
  }
};

/** Cache all available days, to make new script runtime faster */
export const cacheAvailable = async () => {
  for (let day = 1; day <= 25; day++) {
    try {
      await getInput(day);
    } catch (e) {
      break;
    }
  }
};

export const getHtml = async (day: number) => {
  const { data } = await client.get(`/day/${day}`);
  const start = data.indexOf('<article class="day-desc">');
  const end = data.indexOf('</article>', start);
  return data.substring(start, end);
};

export const getMarkdown = async (day: number) => {
  const turndown = new Turndown();
  const html = await getHtml(day);
  return turndown.turndown(html);
};

export const getStarCount = async (day: number) => {
  const { data } = await client.get(`/day/${day}`);
  const {
    window: { document: dom },
  } = new JSDOM(data);
  const hasStars = !!dom.querySelector('.day-success');
  const hasForm = !!dom.querySelector('form');

  return hasForm ? (hasStars ? 1 : 0) : 2;
};

export const submit = async (day: number, part: 1 | 2, answer: unknown) => {
  const formData = new URLSearchParams();
  formData.append('level', part + '');
  formData.append('answer', answer + '');
  console.log(formData.toString());
  const { data }: { data: string } = await client.post(
    `/day/${day}/answer`,
    formData.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const {
    window: { document: dom },
  } = new JSDOM(data);

  const message = dom
    .querySelector('article')
    ?.textContent?.replace(/\[Return .+\]/, '');

  const correct = !!data.match(/That's the right answer!/);

  return { message, correct };
};
