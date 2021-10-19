import _ from 'lodash';

export function getMantissaAndExponent(number: number, fraction = 2) {
  if (!number){
    return null
  }
  if (_.isNumber(number)){
    const scientific = number.toExponential(fraction);
    return scientific.toString().split("e").map((item: any, index) => {
      if (index === 1){
        return Number.parseInt(item)
      }
      const pow = fraction > 0 ? Math.pow(10, fraction) : 1;
      return Math.round(item * pow) / pow
    })
  }

  return null;
}
