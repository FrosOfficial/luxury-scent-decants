import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Inject Laravel token from localStorage before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lsd_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export function mapDbProductToFrontend(dbProduct) {
  const notesObj = {
    top: [],
    middle: [],
    base: []
  };

  if (Array.isArray(dbProduct.notes)) {
    dbProduct.notes.forEach((n) => {
      if (n.layer === 'top') notesObj.top.push(n.note_name);
      else if (n.layer === 'middle' || n.layer === 'mid') notesObj.middle.push(n.note_name);
      else if (n.layer === 'base') notesObj.base.push(n.note_name);
    });
  }

  let performanceObj = { longevity: 'Moderate', sillage: 'Moderate' };
  if (typeof dbProduct.performance === 'string') {
    try { performanceObj = JSON.parse(dbProduct.performance); } catch(e) {}
  } else if (dbProduct.performance) {
    performanceObj = dbProduct.performance;
  }

  let usageObj = { day: true, night: true, seasons: { spring: true, summer: true, autumn: true, winter: true } };
  if (typeof dbProduct.usage === 'string') {
    try { usageObj = JSON.parse(dbProduct.usage); } catch(e) {}
  } else if (dbProduct.usage) {
    usageObj = dbProduct.usage;
  }

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    brand: dbProduct.brand,
    scentProfile: dbProduct.scent_profile,
    demographic: dbProduct.demographic,
    image: (dbProduct.image_url || '/placeholder.png').replace(/\.(png|jpg|jpeg)$/i, '.webp'),
    volumes: Array.isArray(dbProduct.volumes)
      ? dbProduct.volumes.map((v) => ({ id: v.id, size: v.size, price: Number(v.price) }))
      : [],
    mainAccords: Array.isArray(dbProduct.accords)
      ? dbProduct.accords.map((a) => ({ name: a.name, percentage: Number(a.percentage) }))
      : [],
    notes: notesObj,
    performance: performanceObj,
    usage: usageObj,
    rating: Number(dbProduct.rating || 0),
    ratingCount: Number(dbProduct.rating_count || 0)
  };
}

export default api;
