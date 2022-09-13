/**
 * @jest-environment jsdom
 */
import { render, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseUnits } from 'ethers/lib/utils';
import { MKRInput, MKRInputProps } from '../MKRInput';

function renderMKRInput(props: Partial<MKRInputProps> = {}) {
  const defaultProps: MKRInputProps = {
    onChange: jest.fn(),
    value: parseUnits('0')
  };

  return render(<MKRInput {...defaultProps} {...props} />);
}

describe('MKRInput', () => {
  afterEach(cleanup);

  test('Should reflect the text passed as balanceText', async () => {
    const props: Partial<MKRInputProps> = {
      balanceText: 'Hey'
    };

    renderMKRInput(props);

    const component = screen.getByTestId('mkr-input-balance-text');

    expect(component).toHaveTextContent('Hey');
  });

  test('Should reflect the balance of MKR', async () => {
    const props: Partial<MKRInputProps> = {
      balance: parseUnits('24.5')
    };

    renderMKRInput(props);

    const component = screen.getByTestId('mkr-input-balance');

    expect(component).toHaveTextContent('24.5');
    expect(component).not.toHaveTextContent('0.0000');
  });

  test('Should set balance to max when clicking setMax', async () => {
    const props: Partial<MKRInputProps> = {
      balance: parseUnits('24.5'),
      value: parseUnits('0.1'),
      onChange: jest.fn()
    };

    renderMKRInput(props);
    const setMaxButton = screen.getByTestId('mkr-input-set-max');
    const input = screen.getByTestId('mkr-input');

    userEvent.click(setMaxButton);

    expect(props.onChange).toHaveBeenCalledWith(parseUnits('24.5'));

    expect(input).toHaveValue(24.5);
  });

  test('Should trigger on change if the user inputs amount', async () => {
    const props: Partial<MKRInputProps> = {
      balance: parseUnits('24.5'),
      value: parseUnits('0'),
      onChange: jest.fn()
    };

    renderMKRInput(props);
    const input = screen.getByTestId('mkr-input');
    userEvent.type(input, '3');
    const expectedValue = parseUnits('3');
    expect(props.onChange).toHaveBeenCalledWith(expectedValue);
    expect(input).toHaveValue(3);
  });

  test('Should show error if default value is negative amount', async () => {
    const props: Partial<MKRInputProps> = {
      balance: parseUnits('24.5'),
      value: parseUnits('-0.1'),
      onChange: jest.fn()
    };

    renderMKRInput(props);
    const error = screen.getByTestId('mkr-input-error');

    expect(error).toBeVisible();
    expect(error).toHaveTextContent('Please enter a valid amount');
  });

  test('Should show error if value is greater than balance', async () => {
    const props: Partial<MKRInputProps> = {
      balance: parseUnits('24.5'),
      value: parseUnits('34'),
      onChange: jest.fn()
    };

    renderMKRInput(props);
    const error = screen.getByTestId('mkr-input-error');

    expect(error).toBeVisible();
    expect(error).toHaveTextContent('MKR balance too low');
  });
});
