import chalk from 'chalk';
import { program } from 'commander';
import fs from 'fs/promises';
import prompt from 'prompt';
import {
  cacheAvailable,
  getInput,
  getMarkdown,
  getStarCount,
  submit,
} from './aoc/index.js';

type RunFunction = (input: string) => [unknown, unknown] | undefined | string;
type PartFunction = (input: string) => unknown;
type TestData = { in: string; out: string };

const getRunFuncs = async (day: number) => {
  let run: RunFunction | undefined;
  let part1func: PartFunction | undefined;
  let part2func: PartFunction | undefined;

  try {
    ({
      default: run,
      part1: part1func,
      part2: part2func,
    } = await import(`./solutions/${(day + '').padStart(2, '0')}.js`));
  } catch (e) {
    throw new Error(`Solution for day ${day} not found`, { cause: e });
  }

  if (part1func && typeof part1func !== 'function')
    throw new Error(`Part 1 for day ${day} is not a function`);
  if (part2func && typeof part2func !== 'function')
    throw new Error(`Part 2 for day ${day} is not a function`);
  if (run && typeof run !== 'function')
    throw new Error(`Solution for day ${day} is not a function`);

  return { run, part1func, part2func };
};

const runSolution = async (
  day: number,
  input?: string,
): Promise<[unknown, unknown]> => {
  const { run, part1func, part2func } = await getRunFuncs(day);
  if (!input) {
    input = await getInput(day);
  }
  let part1, part2;

  if (run) {
    const result = run(input) || [];

    if (typeof result === 'string') {
      part1 = result;
    } else {
      [part1, part2] = result;
    }
  }

  part1func && (part1 = part1func(input));
  part2func && (part2 = part2func(input));

  return [part1, part2];
};

const getTests = async (day: number) => {
  const tests: {
    part1?: TestData | TestData[];
    part2?: TestData | TestData[];
  } = {};

  try {
    const module = await import(`./tests/${(day + '').padStart(2, '0')}.js`);
    tests.part1 = module.part1;
    tests.part2 = module.part2;
  } catch (e) {
    /* empty */
  }

  if (tests && typeof tests !== 'object')
    throw new Error(`Tests for day ${day} is not an object`);
  if (tests && tests.part1 && !Array.isArray(tests.part1))
    tests.part1 = [tests.part1];
  if (tests && tests.part2 && !Array.isArray(tests.part2))
    tests.part2 = [tests.part2];

  return [tests?.part1, tests?.part2] as [
    TestData[] | undefined,
    TestData[] | undefined,
  ];
};

program
  .command('run', {
    isDefault: true,
  })
  .requiredOption('-d, --day <day>', 'The day to run')
  .action(async options => {
    const day: string = options.day;
    const [part1, part2] = await runSolution(parseInt(day));
    part1 !== undefined && console.log(chalk.cyanBright('Part 1:'), part1);
    part2 !== undefined && console.log(chalk.cyanBright('Part 2:'), part2);
    if (!(part1 ?? part2)) {
      console.log(chalk.yellowBright('No output'));
    }

    const [testsPart1, testsPart2] = await getTests(parseInt(day));
    if (testsPart1 || testsPart2) console.log();

    const logTests = async (tests: typeof testsPart1, part: 0 | 1) => {
      let anyFailed = false;
      if (tests) {
        for (const test of tests) {
          const solution = (await runSolution(parseInt(day), test.in))[part];
          const passed = solution === test.out;
          console.log(
            chalk[passed ? 'greenBright' : 'redBright'](
              `  ${solution} ${passed ? '==' : '!='} ${test.out}`,
            ),
          );

          if (!passed) {
            anyFailed = true;
          }
        }
      }

      return anyFailed;
    };

    const askSubmit = async (part: 1 | 2) => {
      prompt.start({
        message: `Submit part ${part}? (y/n)`,
      });
      prompt.get([`part${part}`], async (_, res) => {
        if (res[`part${part}`] === 'y') {
          const { correct, message } = await submit(parseInt(day), part, part1);
          console.log(
            chalk[correct ? 'greenBright' : 'redBright'](
              message?.replaceAll('  ', '\n'),
            ),
          );
        }
      });
    };

    const stars = await getStarCount(parseInt(day));

    console.log(chalk.yellowBright(`You have ${stars} stars on day ${day}\n`));

    if (testsPart1) {
      console.log(chalk.greenBright('Part 1 tests:'));
      const testFailed = await logTests(testsPart1, 0);
      if (!testFailed && stars < 1) await askSubmit(1);
    }

    if (testsPart1 && testsPart2) console.log();

    if (testsPart2) {
      console.log(chalk.greenBright('Part 2 tests:'));
      const testFailed = await logTests(testsPart2, 1);
      if (!testFailed && stars < 2) await askSubmit(2);
    }
  });

program.command('cache').action(async () => {
  console.log(chalk.cyanBright('Caching inputs...'));
  await cacheAvailable();
  console.log(chalk.greenBright('Done!'));
});

program
  .command('markdown')
  .requiredOption('-d, --day <day>', 'The day to run')
  .option('-o, --output <file>', 'The file to output to')
  .action(async options => {
    const day: string = options.day;
    const output: string | undefined = options.output;
    const markdown = await getMarkdown(parseInt(day));

    if (output) {
      await fs.writeFile(output, markdown);
    } else {
      console.log(markdown);
    }
  });

program
  .command('status')
  .requiredOption('-d, --day <day>', 'The day to run')
  .action(async options => {
    const day: string = options.day;
    const days = await getStarCount(parseInt(day));
    console.log(days);
  });

program.parse();
