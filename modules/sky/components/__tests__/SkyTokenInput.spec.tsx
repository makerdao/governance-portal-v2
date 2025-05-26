/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { render, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseEther } from 'viem';
import { SkyTokenInput, SkyTokenInputProps } from '../SkyTokenInput';
import { vi } from 'vitest';

function renderSKYInput(props: Partial<SkyTokenInputProps> = {}) {
  const defaultProps: SkyTokenInputProps = {
    onChange: vi.fn(),
    value: parseEther('0')
  };

  return render(<SkyTokenInput {...defaultProps} {...props} />);
}

describe('SkyTokenInput', () => {
  afterEach(cleanup);

  test('Should reflect the text passed as balanceText', async () => {
    const props: Partial<SkyTokenInputProps> = {
      balanceText: 'Hey'
    };

    renderSKYInput(props);

    const component = screen.getByTestId('sky-input-balance-text');

    expect(component).toHaveTextContent('Hey');
  });

  test('Should reflect the balance of SKY', async () => {
    const props: Partial<SkyTokenInputProps> = {
      balance: parseEther('24.5')
    };

    renderSKYInput(props);

    const component = screen.getByTestId('sky-input-balance');

    expect(component).toHaveTextContent('24.5');
    expect(component).not.toHaveTextContent('0.0000');
  });

  test('Should set balance to max when clicking setMax', async () => {
    const props: Partial<SkyTokenInputProps> = {
      balance: parseEther('24.5'),
      value: parseEther('0.1'),
      onChange: vi.fn()
    };

    renderSKYInput(props);
    const setMaxButton = screen.getByTestId('sky-input-set-max');
    const input = screen.getByTestId('sky-input');

    userEvent.click(setMaxButton);

    expect(props.onChange).toHaveBeenCalledWith(parseEther('24.5'));

    expect(input).toHaveValue(24.5);
  });

  test('Should trigger on change if the user inputs amount', async () => {
    const props: Partial<SkyTokenInputProps> = {
      balance: parseEther('24.5'),
      value: parseEther('0'),
      onChange: vi.fn()
    };

    renderSKYInput(props);
    const input = screen.getByTestId('sky-input');
    userEvent.type(input, '3');
    const expectedValue = parseEther('3');
    expect(props.onChange).toHaveBeenCalledWith(expectedValue);
    expect(input).toHaveValue(3);
  });

  test('Should show error if default value is negative amount', async () => {
    const props: Partial<SkyTokenInputProps> = {
      balance: parseEther('24.5'),
      value: parseEther('-0.1'),
      onChange: vi.fn()
    };

    renderSKYInput(props);
    const error = screen.getByTestId('sky-input-error');

    expect(error).toBeVisible();
    expect(error).toHaveTextContent('Please enter a valid amount');
  });

  test('Should show error if value is greater than balance', async () => {
    const props: Partial<SkyTokenInputProps> = {
      balance: parseEther('24.5'),
      value: parseEther('34'),
      onChange: vi.fn()
    };

    renderSKYInput(props);
    const error = screen.getByTestId('sky-input-error');

    expect(error).toBeVisible();
    expect(error).toHaveTextContent('SKY balance too low');
  });
});
