// Copyright (c) 2020 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Header from './Header';
import _debounce from 'lodash/debounce';

jest.mock('lodash/debounce');

describe('Header Component', () => {
  const lookback = 4;
  const minProps = {
    lookback,
    setLookback: jest.fn(),
    setService: jest.fn(),
  };
  const service = 'test service';
  const props = {
    ...minProps,
    service,
    services: ['foo', 'bar', 'baz'],
  };

  beforeAll(() => {
    jest.useFakeTimers();
    _debounce.mockImplementation((fn) => {
      return (...args) => {
        fn(...args);
      };
    });    
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders correctly with minimum props', () => {
    render(<Header {...minProps} />);
    expect(screen.getByLabelText(/lookback:/i)).toBeInTheDocument();
  });

  it('renders correctly with full props', () => {
    render(<Header {...props} />);
    expect(screen.getByLabelText(/lookback:/i)).toBeInTheDocument();
    expect(screen.getByText(/select a service/i)).toBeInTheDocument();
  });

  it('displays the lookback value from props when state.ownInputValue is undefined', () => {
    render(<Header {...props} />);
    expect(screen.getByLabelText(/lookback:/i)).toHaveValue(String(lookback));
  });

  it('updates the lookback value when state.ownInputValue is set', () => {
    render(<Header {...props} />);
    const input = screen.getByLabelText(/lookback:/i);

    fireEvent.change(input, { target: { value: '27' } });
    expect(input).toHaveValue(String(27));
  });

  it('calls setLookback with the correct value after debounce', () => {
    render(<Header {...props} />);
    const input = screen.getByLabelText(/lookback:/i);

    fireEvent.change(input, { target: { value: '42' } });
    expect(props.setLookback).not.toHaveBeenCalled();

    jest.runAllTimers();
    expect(props.setLookback).toHaveBeenCalledWith(42);
  });

  it('does not update state for string input values', () => {
    render(<Header {...props} />);
    const input = screen.getByLabelText(/lookback:/i);

    fireEvent.change(input, { target: { value: 'foo' } });
    expect(input).toHaveValue(null);
    expect(props.setLookback).not.toHaveBeenCalled();
  });
});
