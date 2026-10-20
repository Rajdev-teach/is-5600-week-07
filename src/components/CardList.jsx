import React, { useEffect, useState } from 'react';
import Card from './Card';
import Button from './Button';
import Search from './Search';
import { BASE_URL } from '../config';

const CardList = () => {
  const limit = 10;
  const [offset, setOffset] = useState(0);
  const [tag, setTag] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ offset, limit });
    if (tag) query.set('tag', tag);
    setError('');
    fetch(`${BASE_URL}/products?${query}`)
      .then(response => {
        if (!response.ok) throw new Error('Unable to load products');
        return response.json();
      })
      .then(data => { if (active) setProducts(data); })
      .catch(() => {
        if (active) { setProducts([]); setError('Unable to load products.'); }
      });
    return () => { active = false; };
  }, [offset, tag]);

  const filterTags = query => { setTag(query.trim()); setOffset(0); };

  return (
    <div className="cf pa2">
      <Search filter={filterTags} />
      {error && <p role="alert">{error}</p>}
      <div className="mt2 mb2">
        {products.map(product => <Card key={product._id} {...product} />)}
      </div>
      <div className="flex items-center justify-center pa4">
        <Button text="Previous" handleClick={() => setOffset(value => Math.max(0, value - limit))} />
        <Button text="Next" handleClick={() => setOffset(value => value + limit)} />
      </div>
    </div>
  );
};

export default CardList;
