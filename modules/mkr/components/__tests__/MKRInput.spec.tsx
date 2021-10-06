import React from 'react';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';

import { MKRInput, MKRInputProps } from '../MKRInput';
import BigNumber from 'bignumber.js';

function renderMKRInput(props: Partial<MKRInputProps> = {}) {
  const defaultProps: MKRInputProps = {
    onChange: jest.fn(),
    value: new BigNumber(0)
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
      balance: new BigNumber(24.5)
    };

    renderMKRInput(props);

    const component = screen.getByTestId('mkr-input-balance');

    expect(component).toHaveTextContent('24.5000');
    expect(component).not.toHaveTextContent('0.0000');
  });

  test('Should set balance to max when clicking setMax', async () => {
    const props: Partial<MKRInputProps> = {
      balance: new BigNumber(24.5),
      value: new BigNumber(0.1),
      onChange: jest.fn()
    };

    renderMKRInput(props);
    const setMaxButton = screen.getByTestId('mkr-input-set-max');
    const input = screen.getByTestId('mkr-input');

    // Click on the button
    fireEvent.click(setMaxButton);

    expect(props.onChange).toHaveBeenCalledWith(new BigNumber(24.5));

    expect(input).toHaveValue(24.5);
  });

  test('Should trigger on change if the user inputs amount', async () => {
    const props: Partial<MKRInputProps> = {
      balance: new BigNumber(24.5),
      value: new BigNumber(0),
      onChange: jest.fn()
    };

    renderMKRInput(props);
    const input = screen.getByTestId('mkr-input');
    fireEvent.change(input, { target: { value: '3.2' } });
    expect(props.onChange).toHaveBeenCalledWith(new BigNumber(3.2));
    expect(input).toHaveValue(3.2);
  });

  test('Should show error if default value is negative amount', async () => {
    const props: Partial<MKRInputProps> = {
      balance: new BigNumber(24.5),
      value: new BigNumber(-0.1),
      onChange: jest.fn()
    };

    renderMKRInput(props);
    const error = screen.getByTestId('mkr-input-error');

    expect(error).toBeVisible();
    expect(error).toHaveTextContent('Please enter a valid amount');
  });

  test('Should show error if value is greater than balance', async () => {
    const props: Partial<MKRInputProps> = {
      balance: new BigNumber(24.5),
      value: new BigNumber(34),
      onChange: jest.fn()
    };

    renderMKRInput(props);
    const error = screen.getByTestId('mkr-input-error');

    expect(error).toBeVisible();
    expect(error).toHaveTextContent('MKR balance too low');
  });
});
