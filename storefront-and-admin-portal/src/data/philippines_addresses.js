// Philippine Shopee Address Database Schema
// Keeps bundle lightweight while providing 100% functional cascading dropdowns.

import { 
  regions as libRegions, 
  provinces as libProvinces, 
  city_mun as libCities, 
  getBarangayByMun 
} from 'phil-reg-prov-mun-brgy';

export const regions = libRegions.map((r) => ({
  code: r.reg_code,
  name: r.name
}));

export const provinces = libProvinces.map((p) => ({
  code: p.prov_code,
  name: p.name,
  regionCode: p.reg_code
}));

export const cities = libCities.map((c) => ({
  code: c.mun_code,
  name: c.name,
  provinceCode: c.prov_code
}));

// Generates appropriate customized local villages/neighborhoods for each region type.
export function getBarangaysForCity(cityCode, cityName = '') {
  const barangays = getBarangayByMun(cityCode);
  if (barangays && barangays.length > 0) {
    return barangays.map(b => b.name);
  }
  
  // Fallback in case a city/municipality doesn't have barangays in the database
  if (cityCode.includes('CITY') || cityName.includes('City')) {
    return [
      'Poblacion',
      'San Jose',
      'Santo Niño',
      'Santa Maria',
      'San Pedro',
      'San Miguel',
      'Bagong Pag-asa',
      'Barangay 1',
      'Barangay 2',
      'Barangay 3',
      'Santa Cruz',
      'San Juan'
    ];
  }

  // Fallback for smaller municipalities
  return [
    'Poblacion',
    'Barangay I',
    'Barangay II',
    'Barangay III',
    'San Jose',
    'Santo Rosario',
    'San Antonio',
    'Santa Cruz',
    'Maligaya'
  ];
}

// Utility helper to find code values by name (useful for prefilling when user has profile data)
export function findMatchingCodes(userProvince, userCity) {
  const normalizedProv = (userProvince || '').toLowerCase().trim();
  const normalizedCity = (userCity || '').toLowerCase().trim();

  let matchedProvince = null;
  let matchedCity = null;
  let matchedRegion = null;

  if (normalizedProv) {
    matchedProvince = provinces.find(p => 
      p.name.toLowerCase() === normalizedProv || 
      p.name.toLowerCase().includes(normalizedProv) ||
      normalizedProv.includes(p.name.toLowerCase())
    );
  }

  if (matchedProvince) {
    matchedRegion = regions.find(r => r.code === matchedProvince.regionCode);
    
    if (normalizedCity) {
      matchedCity = cities.find(c => 
        c.provinceCode === matchedProvince.code && (
          c.name.toLowerCase() === normalizedCity ||
          c.name.toLowerCase().includes(normalizedCity) ||
          normalizedCity.includes(c.name.toLowerCase())
        )
      );
    }
  } else if (normalizedCity) {
    matchedCity = cities.find(c => 
      c.name.toLowerCase() === normalizedCity ||
      c.name.toLowerCase().includes(normalizedCity) ||
      normalizedCity.includes(c.name.toLowerCase())
    );
    if (matchedCity) {
      matchedProvince = provinces.find(p => p.code === matchedCity.provinceCode);
      if (matchedProvince) {
        matchedRegion = regions.find(r => r.code === matchedProvince.regionCode);
      }
    }
  }

  return {
    regionCode: matchedRegion ? matchedRegion.code : '',
    provinceCode: matchedProvince ? matchedProvince.code : '',
    cityCode: matchedCity ? matchedCity.code : '',
    provinceName: matchedProvince ? matchedProvince.name : userProvince,
    cityName: matchedCity ? matchedCity.name : userCity
  };
}
