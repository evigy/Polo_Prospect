import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const MAX_PHOTOS = 5;

const ListHorse = () => {
  const [form, setForm] = useState({});
  // Dynamic stacked inputs: start with one empty slot
  const [imageInputs, setImageInputs] = useState([null]);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFileChangeAt = (index, file) => {
    setImageInputs((prev) => {
      const next = [...prev];
      next[index] = file || null;

      // If user selected a file in the last non-empty slot and we have room, add a new empty input
      const nonEmpty = next.filter(Boolean);
      const hasEmptyTail = next[next.length - 1] === null;
      if (nonEmpty.length < MAX_PHOTOS && !hasEmptyTail) {
        next.push(null);
      }
      return next;
    });
  };

  const removeFileAt = (index) => {
    setImageInputs((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      if (next.length === 0) next.push(null);
      // Ensure there's always a trailing empty input if less than MAX
      const nonEmptyCount = next.filter(Boolean).length;
      const hasEmptyTail = next[next.length - 1] === null;
      if (nonEmptyCount < MAX_PHOTOS && !hasEmptyTail) next.push(null);
      return next;
    });
  };

  const uploadFiles = async () => {
    const files = imageInputs.filter(Boolean);
    if (!files.length) return { photo_path: null, photo_urls: null };

    const urls = [];
    for (const file of files) {
      const fileName = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: upErr } = await supabase
        .storage
        .from('horse-photos')
        .upload(fileName, file, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('horse-photos').getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return { photo_path: urls[0] || null, photo_urls: urls };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!isAuthenticated || !user) {
        return navigate('/login');
      }

      // Upload up to MAX_PHOTOS
      const { photo_path, photo_urls } = await uploadFiles();

      const payload = {
        owner_id: user.id,
        name: form.name || null,
        age: form.age ? Number(form.age) : null,
        breed: form.breed || null,
        height_hh: form.height ? Number(form.height) : null,
        color: form.color || null,
        gender: form.gender || null,
        price: form.price ? Number(form.price) : null,
        location: form.location || null,
        notes: form.notes || null,
        status: 'active',
        photo_path,
        photo_urls,                // multiple

        experience: form.experience || null,
        contact: form.contact || null,
      };

      const { error: insertErr } = await supabase.from('horses').insert(payload);
      if (insertErr) throw insertErr;

      navigate('/horses');
    } catch (err) {
      console.error('Error listing horse:', err.message || err);
      setError(err.message || 'Failed to create listing.');
    }
  };

  const leftAds = [
    { src: '/ads/casablanca.png', url: 'https://casablancapolo.com/' },
    { src: '/ads/fagliano.jpg', url: 'https://www.casafagliano.com/polo/boots/' },
    { src: '/ads/miguelacuna.png', url: 'https://www.monturasmiguel.com/' },
  ];

  const rightAds = [
    { src: '/ads/ona.webp', url: 'https://onapolo.com/' },
    { src: '/ads/texaspolo.jpg', url: 'https://www.texaspolo.com/' },
    { src: '/ads/zappala.png', url: 'https://casazappala.com/' },
  ];

  return (
    <section className="max-w-screen-xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-center">List Your Horse</h2>

      <div className="flex flex-col md:flex-row items-stretch gap-8">
        {/* Left Ads */}
        <div className="flex flex-col w-full md:w-1/6 h-full">
          {leftAds.map((ad, idx) => (
            <a
              key={idx}
              href={ad.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 mb-4 last:mb-0"
            >
              <img
                src={ad.src}
                alt={`Ad ${idx + 1}`}
                className="w-full h-full object-cover rounded shadow-md hover:opacity-90 transition"
              />
            </a>
          ))}
        </div>

        {/* Listing Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-4/6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {error && (
            <div className="md:col-span-2 text-red-600">{error}</div>
          )}

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Name</label>
            <input name="name" required onChange={handleChange} className="border rounded px-3 py-2" />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Age</label>
            <input name="age" required onChange={handleChange} className="border rounded px-3 py-2" />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Breed</label>
            <input name="breed" required onChange={handleChange} className="border rounded px-3 py-2" />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Height (hh)</label>
            <input name="height" required onChange={handleChange} className="border rounded px-3 py-2" />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Color</label>
            <input name="color" required onChange={handleChange} className="border rounded px-3 py-2" />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Price</label>
            <input name="price" required onChange={handleChange} className="border rounded px-3 py-2" />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Gender</label>
            <select name="gender" required onChange={handleChange} className="border rounded px-3 py-2">
              <option value="">Select gender</option>
              <option value="Mare">Mare</option>
              <option value="Gelding">Gelding</option>
              <option value="Stallion">Stallion</option>
            </select>
          </div>

          {/* Experience */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Experience</label>
            <select name="experience" onChange={handleChange} className="border rounded px-3 py-2">
              <option value="">Select level</option>
              <option value="Prospect">Prospect</option>
              <option value="Green">Green</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Location</label>
            <input name="location" required onChange={handleChange} className="border rounded px-3 py-2" />
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Contact (email or phone)</label>
            <input name="contact" onChange={handleChange} className="border rounded px-3 py-2" />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-medium">Additional Notes</label>
            <textarea name="notes" rows="4" onChange={handleChange} className="border rounded px-3 py-2" />
          </div>

          {/* STACKED PHOTO INPUTS */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-medium">Upload Photos (up to 5)</label>

            <div className="space-y-2">
              {imageInputs.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChangeAt(idx, e.target.files?.[0] || null)}
                    className="border rounded px-3 py-2 w-full"
                  />
                  {file && (
                    <>
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFileAt(idx)}
                        className="bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Selected {imageInputs.filter(Boolean).length} / {MAX_PHOTOS}
            </p>
          </div>

          <div className="md:col-span-2 text-center">
            <button
              type="submit"
              className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-900 transition"
            >
              Submit Listing
            </button>
          </div>
        </form>

        {/* Right Ads */}
        <div className="flex flex-col w-full md:w-1/6 h-full">
          {rightAds.map((ad, idx) => (
            <a
              key={idx}
              href={ad.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 mb-4 last:mb-0"
            >
              <img
                src={ad.src}
                alt={`Ad ${idx + 4}`}
                className="w-full h-full object-cover rounded shadow-md hover:opacity-90 transition"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListHorse;