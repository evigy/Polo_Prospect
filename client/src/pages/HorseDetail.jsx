import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../contexts/AuthContext';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const formatPrice = (val) => {
  if (val === null || val === undefined || val === '' || isNaN(Number(val))) return '—';
  return currency.format(Number(val));
};

const HorseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('horses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setHorse(data);
      } catch (err) {
        console.error(err);
        // If not authorized to see (e.g., sold listing not owned), go back to list
        navigate('/horses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const images = useMemo(() => {
    if (!horse) return [];
    if (horse.photo_urls?.length) return horse.photo_urls;
    return horse.photo_path ? [horse.photo_path] : [];
  }, [horse]);

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  const renderContact = (val) => {
    if (!val) return '—';
    const v = String(val).trim();
    if (v.includes('@')) return <a href={`mailto:${v}`} className="text-blue-700 underline">{v}</a>;
    const digits = v.replace(/[^\d+]/g, '');
    return <a href={`tel:${digits}`} className="text-blue-700 underline">{v}</a>;
  };

  if (loading) {
    return (
      <section className="max-w-screen-xl mx-auto px-4 py-10">
        <p className="text-center text-gray-500">Loading...</p>
      </section>
    );
  }

  if (!horse) {
    return (
      <section className="max-w-screen-xl mx-auto px-4 py-10">
        <p className="text-center text-gray-600">Listing not found.</p>
        <div className="text-center mt-4">
          <Link to="/horses" className="text-blue-700 underline">Back to Horses</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link to="/horses" className="text-blue-700 underline">&larr; Back to Horses</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Big image + thumbs */}
        <div className="relative">
          <div className="relative">
            {images.length ? (
              <img
                src={images[idx]}
                alt={horse.name}
                className="w-full h-[420px] object-cover rounded-lg shadow"
              />
            ) : (
              <img
                src="/default-horse.jpg"
                alt="Default horse"
                className="w-full h-[420px] object-cover rounded-lg shadow"
              />
            )}

            {horse.status === 'sold' && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                SOLD
              </span>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute top-1/2 -translate-y-1/2 left-3 bg-black/40 text-white px-3 py-2 rounded"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute top-1/2 -translate-y-1/2 right-3 bg-black/40 text-white px-3 py-2 rounded"
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-16 w-24 flex-shrink-0 rounded overflow-hidden border ${i === idx ? 'border-blue-600' : 'border-gray-200'}`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt={`thumb-${i}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-2">{horse.name}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><span className="font-semibold">Age:</span> {horse.age ?? '—'}</div>
            <div><span className="font-semibold">Breed:</span> {horse.breed || '—'}</div>
            <div><span className="font-semibold">Gender:</span> {horse.gender || '—'}</div>
            <div><span className="font-semibold">Color:</span> {horse.color || '—'}</div>
            <div><span className="font-semibold">Height (hh):</span> {horse.height_hh ?? '—'}</div>
            <div><span className="font-semibold">Experience:</span> {horse.experience || '—'}</div>
            <div><span className="font-semibold">Location:</span> {horse.location || '—'}</div>
            <div>
              <span className="font-semibold">Price:</span>{' '}
              {horse.status === 'sold' ? 'Sold' : formatPrice(horse.price)}
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold">Contact:</span> {renderContact(horse.contact)}
            </div>
          </div>

          {horse.notes && (
            <div className="mt-4">
              <h3 className="font-semibold mb-1">Notes</h3>
              <p className="text-gray-700">{horse.notes}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HorseDetail;