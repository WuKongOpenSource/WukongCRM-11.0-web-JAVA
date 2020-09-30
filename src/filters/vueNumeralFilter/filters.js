import numeral from 'numeral'

const abbreviate = value => numeral(value).format('0.0a')

const bytes = value => numeral(value).format('0 b')

const exposedNumeral = (value, format) => numeral(value).format(format)

const exponential = value => numeral(value).format('0.[00]e+0')

const ordinal = value => numeral(value).format('Oo')

const percentage = value => numeral(value).format('0.[00]%')

const separator = value => numeral(value).format('0,0.00')

const separatorInt = value => numeral(value).format('0,0')

const currency = value => numeral(value).format('$0,0.00')

export {
  abbreviate,
  bytes,
  exponential,
  exposedNumeral,
  ordinal,
  percentage,
  separator,
  separatorInt,
  currency
}
