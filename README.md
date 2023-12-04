# Advent of code for typescript

This repo contains my solutions to advent of code 2022 and a wrapper to make it as easy as possible to fetch input, write solutions and submit the answers

The script to submit/run the results is pretty spaghettiy and badly written, but should work.

Features:

- CLI
- Fetches and caches input data automatically
- Ability to provide checks for the code before submission
- Allows you to submit your result easily if all checks passes from within the cli
- TypeScript

## Usage:

### CLI/use the existing code

1. Clone the repo
1. Run `yarn` in the repo
1. Create .env-file with content
   ```ini
   YEAR=2022
   SESSION=<your-session-cookie>
   ```
   which can be found in the storage tab in your favorite browser devtools when on https://adventofcode.com
1. Run `yarn start -d <day-to-solve>`
   > You can also see more options for the script with `yarn start -h`

### solutions/-folder

Create files called `0<day>.ts` (remove the 0 if after day 0) which exports functions called part1 and part2, or a default export which returns an array of both answers (`[part1, part2]`).
The functions will get the input data provided from the first argument as a string

You can import lodash etc. in the scripts to use those functions.

If you want to use this for yourself, remove all content in the solutions-folder and you should be able to use it for your own solutions :)

### tests/-folder

This folder contains the same `0<day>.ts` files but exports objects part1 and part2 with the structure of `{ in: <test-input>, out: <test-output> }`
and will automatically run after to check if you should be able to submit the result to aoc.

You can also export arrays of these objects to run multiple checks on each part.
