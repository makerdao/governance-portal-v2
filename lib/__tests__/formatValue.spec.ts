import { parseUnits } from 'ethers/lib/utils';
import { formatValue } from 'lib/string';

describe('Format value for numbers', () => {
  it('Should round down numbers', () => {
    const result = formatValue(parseUnits('0.00132'), undefined, undefined, true, true);

    expect(result).toEqual('≈0.00');
  });

  it('should not round down if disabled', () => {
    const result = formatValue(parseUnits('0.00132'), undefined, 3);

    expect(result).toEqual('0.001');
  });

  it('should not display commas if not stated', () => {
    const result = formatValue(parseUnits('10222.0132'), undefined, undefined, false, true);

    expect(result).toEqual('10222');
  });

  it('should not show decimals for a number bigger than 999', () => {
    const result = formatValue(parseUnits('10222.013222'));

    expect(result).toEqual('10,222');
  });

  it('should show 2 decimals for number less than 999', () => {
    const result = formatValue(parseUnits('222.013222'));

    expect(result).toEqual('222.01');
  });

  it('should show  5 decimals for number less than 999 if specified to 5', () => {
    const result = formatValue(parseUnits('222.013222'), undefined, 5);

    expect(result).toEqual('222.01322');
  });
});
