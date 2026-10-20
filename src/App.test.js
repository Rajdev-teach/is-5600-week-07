import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { CartProvider, useCart } from './state/CartProvider';
import Cart from './components/Cart';

const product = { _id: 'photo1', description: 'Blue photo', price: 5, likes: 1,
  user: { first_name: 'Test', last_name: 'Artist', username: 'artist' },
  urls: { small: 'test.jpg', regular: 'test.jpg' } };
const response = data => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test('the catalog mounts and sends tag searches to the API', async () => {
  const fetch = vi.fn(() => response([product]));
  vi.stubGlobal('fetch', fetch);
  render(React.createElement(MemoryRouter, null, React.createElement(App)));
  await screen.findByText('Blue photo');
  fireEvent.change(screen.getByPlaceholderText('Tag Search'), { target: { value: 'blue & green' } });
  fireEvent.click(screen.getByDisplayValue('Search'));
  await waitFor(() => expect(new URL(fetch.mock.calls.at(-1)[0]).searchParams.get('tag')).toBe('blue & green'));
});

test('a product detail view fetches once instead of looping after every render', async () => {
  const fetch = vi.fn(() => response(product));
  vi.stubGlobal('fetch', fetch);
  render(React.createElement(MemoryRouter, { initialEntries: ['/product/photo1'] }, React.createElement(App)));
  await screen.findByText('Blue photo');
  await new Promise(resolve => setTimeout(resolve, 25));
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Add to Cart')).toBeTruthy();
});

test('reducing the last cart item removes it and keeps the total nonnegative', () => {
  function AddItem() {
    const { addToCart } = useCart();
    return React.createElement('button', { onClick: () => addToCart(product) }, 'Add item');
  }
  render(React.createElement(CartProvider, null,
    React.createElement(AddItem), React.createElement(Cart)));
  fireEvent.click(screen.getByText('Add item'));
  expect(screen.getByText('Blue photo')).toBeTruthy();
  fireEvent.click(screen.getByText('-'));
  expect(screen.queryByText('Blue photo')).toBeNull();
  expect(screen.getByText(/Total:/).textContent).toContain('0.00');
});
