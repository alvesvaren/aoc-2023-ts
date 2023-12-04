import _ from 'lodash';

export function part1(input: string) {
  const lines = input.split('\n').slice(0, -1);
  const vals = lines.map(line => {
    const matches = Array.from(line.matchAll(/\d/g));
    const [first] = matches[0];
    const [last] = matches.at(-1)!;
    const val = first + last;
    return +val;
  });

  return _.sum(vals);
}

const map: Record<string, string> = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
};

export function part2(input: string) {
  const lines = input.split('\n').slice(0, -1);
  const vals = lines.map(line => {
    let first = line.match(
      /\d|zero|one|two|three|four|five|six|seven|eight|nine/g,
    )?.[0]!;
    let last = _.reverse([...line])
      .join('')
      .match(/\d|orez|eno|owt|eerht|ruof|evif|xis|neves|thgie|enin/g)![0];
    let reversedLast = _.reverse([...last]).join('');

    first = map[first] ?? first;
    reversedLast = map[reversedLast] ?? reversedLast;

    const val = first + reversedLast;
    return +val;
  });

  return _.sum(vals);
}
