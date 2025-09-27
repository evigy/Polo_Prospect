// client/src/pages/HorsesForSale.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom'; // NEW
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../contexts/AuthContext';

const MAX_PHOTOS = 5;

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const formatPrice = (val) => {
  if (val === null || val === undefined || val === '' || isNaN(Number(val))) return '—';
  return currency.format(Number(val));
};

const HorsesForSale = () => {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Per-card edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImageInputs, setEditImageInputs] = useState([null]); // stacked inputs in edit
  const [saving, setSaving] = useState(false);

  // Per-card carousel index map: { [horseId]: number }
  const [carouselIndex, setCarouselIndex] = useState({});

  // ⬇️ pull isAdmin from context (added)
  const { user, isAdmin } = useContext(AuthContext);

  const fetchHorses = async () => {
    try {
      const { data, error } = await supabase
        .from('horses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHorses(data || []);
    } catch (err) {
      console.error('Error fetching horses:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const { error } = await supabase.from('horses').delete().eq('id', id);
      if (error) throw error;
      setHorses((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Error deleting horse:', err.message || err);
    }
  };

  // ----- Edit flow -----
  const startEdit = (horse) => {
    setEditingId(horse.id);
    setEditForm({
      name: horse.name || '',
      age: horse.age ?? '',
      breed: horse.breed || '',
      height_hh: horse.height_hh ?? '',
      color: horse.color || '',
      gender: horse.gender || '',
      price: horse.price ?? '',
      location: horse.location || '',
      notes: horse.notes || '',
      status: horse.status || 'active',
      photo_path: horse.photo_path || '',
      photo_urls: horse.photo_urls || [],
      experience: horse.experience || '',
      contact: horse.contact || '',
    });
    setEditImageInputs([null]); // reset stacked inputs for replacement
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditImageInputs([null]);
    setSaving(false);
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  // Stacked inputs logic for EDIT
  const handleEditFileChangeAt = (index, file) => {
    setEditImageInputs((prev) => {
      const next = [...prev];
      next[index] = file || null;

      const nonEmpty = next.filter(Boolean);
      const hasEmptyTail = next[next.length - 1] === null;
      if (nonEmpty.length < MAX_PHOTOS && !hasEmptyTail) {
        next.push(null);
      }
      return next;
    });
  };

  const removeEditFileAt = (index) => {
    setEditImageInputs((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      if (next.length === 0) next.push(null);
      const nonEmptyCount = next.filter(Boolean).length;
      const hasEmptyTail = next[next.length - 1] === null;
      if (nonEmptyCount < MAX_PHOTOS && !hasEmptyTail) next.push(null);
      return next;
    });
  };

  const uploadNewPhotos = async () => {
    const files = editImageInputs.filter(Boolean);
    if (!files.length) return null;
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
    return urls;
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      let photo_urls = editForm.photo_urls || null;
      let photo_path = editForm.photo_path || null;

      // If user provided any new photos, REPLACE gallery with those
      if (editImageInputs.filter(Boolean).length) {
        const urls = await uploadNewPhotos();
        photo_urls = urls;
        photo_path = urls?.[0] || photo_path || null;
      }

      const patch = {
        name: editForm.name || null,
        age: editForm.age !== '' ? Number(editForm.age) : null,
        breed: editForm.breed || null,
        height_hh: editForm.height_hh !== '' ? Number(editForm.height_hh) : null,
        color: editForm.color || null,
        gender: editForm.gender || null,
        price: editForm.price !== '' ? Number(editForm.price) : null,
        location: editForm.location || null,
        notes: editForm.notes || null,
        status: editForm.status || 'active',
        photo_path,
        photo_urls,
        experience: editForm.experience || null,
        contact: editForm.contact || null,
      };

      const { error } = await supabase.from('horses').update(patch).eq('id', id);
      if (error) throw error;

      setHorses((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...patch } : h))
      );

      cancelEdit();
    } catch (err) {
      console.error('Error updating horse:', err.message || err);
      setSaving(false);
    }
  };

  // Contact helper
  const renderContact = (val) => {
    if (!val) return '—';
    const v = String(val).trim();
    if (v.includes('@')) return <a href={`mailto:${v}`} className="text-blue-700 underline">{v}</a>;
    const digits = v.replace(/[^\d+]/g, '');
    return <a href={`tel:${digits}`} className="text-blue-700 underline">{v}</a>;
  };

  // Carousel helpers
  const getImagesForHorse = (horse) => {
    const imgs = horse.photo_urls?.length ? horse.photo_urls : (horse.photo_path ? [horse.photo_path] : []);
    return imgs || [];
  };

  const currentIdx = (horseId) => carouselIndex[horseId] ?? 0;

  const goPrev = (horseId, imgsLen) => {
    setCarouselIndex((prev) => {
      const i = currentIdx(horseId);
      const next = (i - 1 + imgsLen) % imgsLen;
      return { ...prev, [horseId]: next };
    });
  };

  const goNext = (horseId, imgsLen) => {
    setCarouselIndex((prev) => {
      const i = currentIdx(horseId);
      const next = (i + 1) % imgsLen;
      return { ...prev, [horseId]: next };
    });
  };

  return (
    <section className="max-w-screen-xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Horses for Sale</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : horses.length === 0 ? (
        <p className="text-center text-lg text-gray-600 mt-8">
          There are currently no horses for sale.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {horses.map((horse) => {
            const isOwner = user && horse.owner_id === user.id;
            const showDelete = isOwner || isAdmin; // ⬅️ admins can delete any
            const isEditing = editingId === horse.id;

            const imgs = getImagesForHorse(horse);
            const idx = Math.min(currentIdx(horse.id), Math.max(0, imgs.length - 1));
            const showArrows = imgs.length > 1;

            return (
              <div key={horse.id} className="border rounded-lg shadow p-4 bg-white">
                {/* IMAGE / CAROUSEL */}
                <div className="relative">
                  {imgs.length ? (
                    <img
                      src={imgs[idx]}
                      alt={horse.name}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  ) : (
                    <img
                      src="/default-horse.jpg"
                      alt="Default horse"
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}

                  {horse.status === 'sold' && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      SOLD
                    </span>
                  )}

                  {showArrows && (
                    <>
                      <button
                        type="button"
                        onClick={() => goPrev(horse.id, imgs.length)}
                        className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/40 text-white px-2 py-1 rounded"
                        aria-label="Previous photo"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => goNext(horse.id, imgs.length)}
                        className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/40 text-white px-2 py-1 rounded"
                        aria-label="Next photo"
                      >
                        ›
                      </button>

                      {/* dots */}
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                        {imgs.map((_, i) => (
                          <span
                            key={i}
                            className={`h-2 w-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* DETAILS / EDIT */}
                {!isEditing ? (
                  <>
                    <h3 className="text-xl font-semibold mb-1">{horse.name}</h3>
                    <p><strong>Age:</strong> {horse.age ?? '—'}</p>
                    <p><strong>Breed:</strong> {horse.breed || '—'}</p>
                    <p><strong>Gender:</strong> {horse.gender || '—'}</p>
                    <p><strong>Color:</strong> {horse.color || '—'}</p>
                    <p><strong>Experience:</strong> {horse.experience || '—'}</p>
                    <p>
                      <strong>Price:</strong>{' '}
                      {horse.status === 'sold' ? 'Sold' : formatPrice(horse.price)}
                    </p>
                    <p><strong>Location:</strong> {horse.location || '—'}</p>
                    <p><strong>Contact:</strong> {renderContact(horse.contact)}</p>
                    <p className="mt-2 text-sm text-gray-700">{horse.notes || ''}</p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        to={`/horse/${horse.id}`}   // NEW: view page
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        View
                      </Link>

                      {showDelete && (
                        <button
                          onClick={() => handleDelete(horse.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}

                      {isOwner && (
                        <button
                          onClick={() => startEdit(horse)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-3">Edit Listing</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Name</label>
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                          required
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Age</label>
                        <input
                          name="age"
                          value={editForm.age}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Breed</label>
                        <input
                          name="breed"
                          value={editForm.breed}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Height (hh)</label>
                        <input
                          name="height_hh"
                          value={editForm.height_hh}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Color</label>
                        <input
                          name="color"
                          value={editForm.color}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Gender</label>
                        <select
                          name="gender"
                          value={editForm.gender}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        >
                          <option value="">Select gender</option>
                          <option value="Mare">Mare</option>
                          <option value="Gelding">Gelding</option>
                          <option value="Stallion">Stallion</option>
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Experience</label>
                        <select
                          name="experience"
                          value={editForm.experience}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        >
                          <option value="">Select level</option>
                          <option value="Prospect">Prospect</option>
                          <option value="Green">Green</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Price</label>
                        <input
                          name="price"
                          value={editForm.price}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Location</label>
                        <input
                          name="location"
                          value={editForm.location}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Contact (email or phone)</label>
                        <input
                          name="contact"
                          value={editForm.contact}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Additional Notes</label>
                        <textarea
                          name="notes"
                          rows="4"
                          value={editForm.notes}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Status</label>
                        <select
                          name="status"
                          value={editForm.status}
                          onChange={onEditChange}
                          className="border rounded px-3 py-2"
                        >
                          <option value="active">Active</option>
                          <option value="sold">Sold</option>
                        </select>
                      </div>

                      {/* STACKED NEW PHOTO INPUTS (replace gallery) */}
                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">Replace Photos (up to 5)</label>
                        <div className="space-y-2">
                          {editImageInputs.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleEditFileChangeAt(idx, e.target.files?.[0] || null)}
                                className="border rounded px-3 py-2 w-full"
                              />
                              {file && (
                                <>
                                  <span className="text-sm text-gray-600 truncate max-w-[200px]">
                                    {file.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeEditFileAt(idx)}
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
                          Selected {editImageInputs.filter(Boolean).length} / {MAX_PHOTOS}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => saveEdit(horse.id)}
                          disabled={saving}
                          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          type="button"
                          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HorsesForSale;