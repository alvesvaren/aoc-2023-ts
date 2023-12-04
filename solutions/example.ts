import _ from 'lodash';

export default function (data: string) {
  const parts = data.split('\n\n');
  const sums = parts.map(part => _.sum(part.split('\n').map(Number)));

  const top3 = _.takeRight(_.sortBy(sums), 3);
  const top3sum = _.sum(top3);

  return [_.max(sums), top3sum];
}
