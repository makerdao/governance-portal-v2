import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';

import { MKR } from '../../lib/maker';
import {MKRInput} from '../../components/MKRInput';

afterEach(cleanup);

function setup(props) {
  const mockOnChange = jest.fn();
  const utils = render(<MKRInput {...props} onChange={mockOnChange} />);
  const input = utils.getByLabelText('mkr-input');
  return {
    input,
    mockOnChange,
    ...utils
  };
}

test('should call onChange and set a value', () => {
  const { input, mockOnChange } = setup();
  fireEvent.change(input, { target: { value: '23' } });
  expect(input.value).toBe('23');
  expect(mockOnChange.mock.calls.length).toBe(1);
});

test('should trigger the onChange cb with the proper value as a MKR currency object', () => {
  const { input, mockOnChange } = setup();
  fireEvent.change(input, { target: { value: '23' } });
  expect(mockOnChange.mock.calls[0][0]).toEqual(MKR(23));
});

test('should allow changing the value and entering an empty string', () => {
  const { input, mockOnChange } = setup();
  fireEvent.change(input, { target: { value: '23' } });
  expect(mockOnChange.mock.calls[0][0]).toEqual(MKR(23));
  fireEvent.change(input, { target: { value: '' } });
  expect(mockOnChange.mock.calls[1][0]).toEqual(MKR(0));
});

test('should limit inputs based on min', () => {
  const { input, mockOnChange } = setup({ min: MKR(5) });
  // larger than min -> fine
  fireEvent.change(input, { target: { value: '10' } });
  expect(mockOnChange.mock.calls[0][0]).toEqual(MKR(10));
  // equal to min -> fine
  fireEvent.change(input, { target: { value: '5' } });
  expect(mockOnChange.mock.calls[1][0]).toEqual(MKR(5));
  // smaller than min -> onchange isn't called
  expect(mockOnChange.mock.calls.length).toBe(2);
  fireEvent.change(input, { target: { value: '1' } });
  expect(mockOnChange.mock.calls.length).toBe(2);
});

test('should limit inputs based on max', () => {
  const { input, mockOnChange } = setup({ max: MKR(10) });
  // less than max -> fine
  fireEvent.change(input, { target: { value: '5' } });
  expect(mockOnChange.mock.calls[0][0]).toEqual(MKR(5));
  // equal to max -> fine
  fireEvent.change(input, { target: { value: '10' } });
  expect(mockOnChange.mock.calls[1][0]).toEqual(MKR(10));
  // larger than max -> onchange isn't called
  expect(mockOnChange.mock.calls.length).toBe(2);
  fireEvent.change(input, { target: { value: '15' } });
  expect(mockOnChange.mock.calls.length).toBe(2);
});
