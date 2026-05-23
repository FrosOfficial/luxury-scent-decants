import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Error fetching Supabase session in interceptor:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export function mapDbProductToFrontend(dbProduct: any): any {
  const notesObj = {
    top: [] as string[],
    middle: [] as string[],
    base: [] as string[]
  };
  
  if (Array.isArray(dbProduct.notes)) {
    dbProduct.notes.forEach((n: any) => {
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
    occasion: dbProduct.occasion,
    demographic: dbProduct.demographic,
    concentration: dbProduct.concentration,
    image: (dbProduct.image_url || '/placeholder.png').replace(/\.(png|jpg|jpeg)$/i, '.webp'),
    volumes: Array.isArray(dbProduct.volumes) 
      ? dbProduct.volumes.map((v: any) => ({ id: v.id, size: v.size, price: Number(v.price) }))
      : [],
    mainAccords: Array.isArray(dbProduct.accords)
      ? dbProduct.accords.map((a: any) => ({ name: a.name, percentage: Number(a.percentage) }))
      : [],
    notes: notesObj,
    performance: performanceObj,
    usage: usageObj,
    rating: Number(dbProduct.rating || 0),
    ratingCount: Number(dbProduct.rating_count || 0)
  };
}

export default api;
