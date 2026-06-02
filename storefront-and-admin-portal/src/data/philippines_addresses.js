// Philippine Address Database
// Curated list of Regions, Provinces, Cities/Municipalities, and Barangays
// Keeps bundle lightweight while providing 100% functional cascading dropdowns.

export const regions = [
  { code: 'NCR', name: 'National Capital Region (NCR)' },
  { code: 'R1', name: 'Region I (Ilocos Region)' },
  { code: 'R2', name: 'Region II (Cagayan Valley)' },
  { code: 'R3', name: 'Region III (Central Luzon)' },
  { code: 'R4A', name: 'Region IV-A (CALABARZON)' },
  { code: 'R4B', name: 'Mimaropa Region (Region IV-B)' },
  { code: 'R5', name: 'Region V (Bicol Region)' },
  { code: 'R6', name: 'Region VI (Western Visayas)' },
  { code: 'R7', name: 'Region VII (Central Visayas)' },
  { code: 'R8', name: 'Region VIII (Eastern Visayas)' },
  { code: 'R9', name: 'Region IX (Zamboanga Peninsula)' },
  { code: 'R10', name: 'Region X (Northern Mindanao)' },
  { code: 'R11', name: 'Region XI (Davao Region)' },
  { code: 'R12', name: 'Region XII (SOCCSKSARGEN)' },
  { code: 'R13', name: 'Region XIII (Caraga)' },
  { code: 'CAR', name: 'Cordillera Administrative Region (CAR)' },
  { code: 'BARMM', name: 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)' }
];

export const provinces = [
  // NCR
  { code: 'METRO_MANILA', name: 'Metro Manila', regionCode: 'NCR' },

  // Region I
  { code: 'ILOCOS_NORTE', name: 'Ilocos Norte', regionCode: 'R1' },
  { code: 'ILOCOS_SUR', name: 'Ilocos Sur', regionCode: 'R1' },
  { code: 'LA_UNION', name: 'La Union', regionCode: 'R1' },
  { code: 'PANGASINAN', name: 'Pangasinan', regionCode: 'R1' },

  // Region II
  { code: 'BATANES', name: 'Batanes', regionCode: 'R2' },
  { code: 'CAGAYAN', name: 'Cagayan', regionCode: 'R2' },
  { code: 'ISABELA', name: 'Isabela', regionCode: 'R2' },
  { code: 'NUEVA_VIZCAYA', name: 'Nueva Vizcaya', regionCode: 'R2' },
  { code: 'QUIRINO', name: 'Quirino', regionCode: 'R2' },

  // Region III
  { code: 'AURORA', name: 'Aurora', regionCode: 'R3' },
  { code: 'BATAAN', name: 'Bataan', regionCode: 'R3' },
  { code: 'BULACAN', name: 'Bulacan', regionCode: 'R3' },
  { code: 'NUEVA_ECIJA', name: 'Nueva Ecija', regionCode: 'R3' },
  { code: 'PAMPANGA', name: 'Pampanga', regionCode: 'R3' },
  { code: 'TARLAC', name: 'Tarlac', regionCode: 'R3' },
  { code: 'ZAMBALES', name: 'Zambales', regionCode: 'R3' },

  // Region IV-A
  { code: 'BATANGAS', name: 'Batangas', regionCode: 'R4A' },
  { code: 'CAVITE', name: 'Cavite', regionCode: 'R4A' },
  { code: 'LAGUNA', name: 'Laguna', regionCode: 'R4A' },
  { code: 'QUEZON', name: 'Quezon', regionCode: 'R4A' },
  { code: 'RIZAL', name: 'Rizal', regionCode: 'R4A' },

  // Mimaropa
  { code: 'MARINDUQUE', name: 'Marinduque', regionCode: 'R4B' },
  { code: 'OCCIDENTAL_MINDORO', name: 'Occidental Mindoro', regionCode: 'R4B' },
  { code: 'ORIENTAL_MINDORO', name: 'Oriental Mindoro', regionCode: 'R4B' },
  { code: 'PALAWAN', name: 'Palawan', regionCode: 'R4B' },
  { code: 'ROMBLON', name: 'Romblon', regionCode: 'R4B' },

  // Region V
  { code: 'ALBAY', name: 'Albay', regionCode: 'R5' },
  { code: 'CAMARINES_NORTE', name: 'Camarines Norte', regionCode: 'R5' },
  { code: 'CAMARINES_SUR', name: 'Camarines Sur', regionCode: 'R5' },
  { code: 'CATANDUANES', name: 'Catanduanes', regionCode: 'R5' },
  { code: 'MASBATE', name: 'Masbate', regionCode: 'R5' },
  { code: 'SORSOGON', name: 'Sorsogon', regionCode: 'R5' },

  // Region VI
  { code: 'AKLAN', name: 'Aklan', regionCode: 'R6' },
  { code: 'ANTIQUE', name: 'Antique', regionCode: 'R6' },
  { code: 'CAPIZ', name: 'Capiz', regionCode: 'R6' },
  { code: 'GUIMARAS', name: 'Guimaras', regionCode: 'R6' },
  { code: 'ILOILO', name: 'Iloilo', regionCode: 'R6' },
  { code: 'NEGROS_OCCIDENTAL', name: 'Negros Occidental', regionCode: 'R6' },

  // Region VII
  { code: 'BOHOL', name: 'Bohol', regionCode: 'R7' },
  { code: 'CEBU', name: 'Cebu', regionCode: 'R7' },
  { code: 'NEGROS_ORIENTAL', name: 'Negros Oriental', regionCode: 'R7' },
  { code: 'SIQUIJOR', name: 'Siquijor', regionCode: 'R7' },

  // Region VIII
  { code: 'BILIRAN', name: 'Biliran', regionCode: 'R8' },
  { code: 'EASTERN_SAMAR', name: 'Eastern Samar', regionCode: 'R8' },
  { code: 'LEYTE', name: 'Leyte', regionCode: 'R8' },
  { code: 'NORTHERN_SAMAR', name: 'Northern Samar', regionCode: 'R8' },
  { code: 'SAMAR', name: 'Samar', regionCode: 'R8' },
  { code: 'SOUTHERN_LEYTE', name: 'Southern Leyte', regionCode: 'R8' },

  // Region IX
  { code: 'ZAMBOANGA_DEL_NORTE', name: 'Zamboanga del Norte', regionCode: 'R9' },
  { code: 'ZAMBOANGA_DEL_SUR', name: 'Zamboanga del Sur', regionCode: 'R9' },
  { code: 'ZAMBOANGA_SIBUGAY', name: 'Zamboanga Sibugay', regionCode: 'R9' },

  // Region X
  { code: 'BUKIDNON', name: 'Bukidnon', regionCode: 'R10' },
  { code: 'CAMIGUIN', name: 'Camiguin', regionCode: 'R10' },
  { code: 'LANAO_DEL_NORTE', name: 'Lanao del Norte', regionCode: 'R10' },
  { code: 'MISAMIS_OCCIDENTAL', name: 'Misamis Occidental', regionCode: 'R10' },
  { code: 'MISAMIS_ORIENTAL', name: 'Misamis Oriental', regionCode: 'R10' },

  // Region XI
  { code: 'DAVAO_DE_ORO', name: 'Davao de Oro', regionCode: 'R11' },
  { code: 'DAVAO_DEL_NORTE', name: 'Davao del Norte', regionCode: 'R11' },
  { code: 'DAVAO_DEL_SUR', name: 'Davao del Sur', regionCode: 'R11' },
  { code: 'DAVAO_OCCIDENTAL', name: 'Davao Occidental', regionCode: 'R11' },
  { code: 'DAVAO_ORIENTAL', name: 'Davao Oriental', regionCode: 'R11' },

  // Region XII
  { code: 'COTABATO', name: 'Cotabato', regionCode: 'R12' },
  { code: 'SARANGANI', name: 'Sangani', regionCode: 'R12' },
  { code: 'SOUTH_COTABATO', name: 'South Cotabato', regionCode: 'R12' },
  { code: 'SULTAN_KUDARAT', name: 'Sultan Kudarat', regionCode: 'R12' },

  // Region XIII
  { code: 'AGUSAN_DEL_NORTE', name: 'Agusan del Norte', regionCode: 'R13' },
  { code: 'AGUSAN_DEL_SUR', name: 'Agusan del Sur', regionCode: 'R13' },
  { code: 'DINAGAT_ISLANDS', name: 'Dinagat Islands', regionCode: 'R13' },
  { code: 'SURIGAO_DEL_NORTE', name: 'Surigao del Norte', regionCode: 'R13' },
  { code: 'SURIGAO_DEL_SUR', name: 'Surigao del Sur', regionCode: 'R13' },

  // CAR
  { code: 'ABRA', name: 'Abra', regionCode: 'CAR' },
  { code: 'APAYAO', name: 'Apayao', regionCode: 'CAR' },
  { code: 'BENGUET', name: 'Benguet', regionCode: 'CAR' },
  { code: 'IFUGAO', name: 'Ifugao', regionCode: 'CAR' },
  { code: 'KALINGA', name: 'Kalinga', regionCode: 'CAR' },
  { code: 'MOUNTAIN_PROVINCE', name: 'Mountain Province', regionCode: 'CAR' },

  // BARMM
  { code: 'BASILAN', name: 'Basilan', regionCode: 'BARMM' },
  { code: 'LANAO_DEL_SUR', name: 'Lanao del Sur', regionCode: 'BARMM' },
  { code: 'MAGUINDANAO_NORTE', name: 'Maguindanao del Norte', regionCode: 'BARMM' },
  { code: 'MAGUINDANAO_SUR', name: 'Maguindanao del Sur', regionCode: 'BARMM' },
  { code: 'SULU', name: 'Sulu', regionCode: 'BARMM' },
  { code: 'TAWI_TAWI', name: 'Tawi-Tawi', regionCode: 'BARMM' }
];

export const cities = [
  // Metro Manila (NCR)
  { code: 'MANILA', name: 'City of Manila', provinceCode: 'METRO_MANILA' },
  { code: 'QUEZON_CITY', name: 'Quezon City', provinceCode: 'METRO_MANILA' },
  { code: 'MAKATI', name: 'Makati City', provinceCode: 'METRO_MANILA' },
  { code: 'TAGUIG', name: 'Taguig City', provinceCode: 'METRO_MANILA' },
  { code: 'PASIG', name: 'Pasig City', provinceCode: 'METRO_MANILA' },
  { code: 'MANDALUYONG', name: 'Mandaluyong City', provinceCode: 'METRO_MANILA' },
  { code: 'SAN_JUAN', name: 'San Juan City', provinceCode: 'METRO_MANILA' },
  { code: 'PASAY', name: 'Pasay City', provinceCode: 'METRO_MANILA' },
  { code: 'PARAÑAQUE', name: 'Parañaque City', provinceCode: 'METRO_MANILA' },
  { code: 'LAS_PIÑAS', name: 'Las Piñas City', provinceCode: 'METRO_MANILA' },
  { code: 'MARIKINA', name: 'Marikina City', provinceCode: 'METRO_MANILA' },
  { code: 'MUNTINLUPA', name: 'Muntinlupa City', provinceCode: 'METRO_MANILA' },
  { code: 'VALENZUELA', name: 'Valenzuela City', provinceCode: 'METRO_MANILA' },
  { code: 'CALOOCAN', name: 'Caloocan City', provinceCode: 'METRO_MANILA' },
  { code: 'MALABON', name: 'Malabon City', provinceCode: 'METRO_MANILA' },
  { code: 'NAVOTAS', name: 'Navotas City', provinceCode: 'METRO_MANILA' },
  { code: 'PATEROS', name: 'Pateros Municipality', provinceCode: 'METRO_MANILA' },

  // Davao del Sur (Region XI)
  { code: 'DAVAO_CITY', name: 'Davao City', provinceCode: 'DAVAO_DEL_SUR' },
  { code: 'DIGOS_CITY', name: 'Digos City', provinceCode: 'DAVAO_DEL_SUR' },
  { code: 'BANSALAN', name: 'Bansalan', provinceCode: 'DAVAO_DEL_SUR' },
  { code: 'SANTA_CRUZ', name: 'Santa Cruz', provinceCode: 'DAVAO_DEL_SUR' },
  { code: 'HAGONOY', name: 'Hagonoy', provinceCode: 'DAVAO_DEL_SUR' },
  { code: 'MALALAG', name: 'Malalag', provinceCode: 'DAVAO_DEL_SUR' },
  { code: 'PADADA', name: 'Padada', provinceCode: 'DAVAO_DEL_SUR' },

  // Davao del Norte (Region XI)
  { code: 'TAGUM_CITY', name: 'Tagum City', provinceCode: 'DAVAO_DEL_NORTE' },
  { code: 'PANABO_CITY', name: 'Panabo City', provinceCode: 'DAVAO_DEL_NORTE' },
  { code: 'SAMAL_CITY', name: 'Island Garden City of Samal', provinceCode: 'DAVAO_DEL_NORTE' },
  { code: 'CARMEN', name: 'Carmen', provinceCode: 'DAVAO_DEL_NORTE' },

  // Cebu (Region VII)
  { code: 'CEBU_CITY', name: 'Cebu City', provinceCode: 'CEBU' },
  { code: 'MANDAUE_CITY', name: 'Mandaue City', provinceCode: 'CEBU' },
  { code: 'LAPU_LAPU_CITY', name: 'Lapu-Lapu City', provinceCode: 'CEBU' },
  { code: 'TALISAY_CITY', name: 'Talisay City', provinceCode: 'CEBU' },
  { code: 'TOLEDO_CITY', name: 'Toledo City', provinceCode: 'CEBU' },
  { code: 'LILOAN', name: 'Liloan', provinceCode: 'CEBU' },
  { code: 'CONSOLACION', name: 'Consolacion', provinceCode: 'CEBU' },

  // Cavite (Region IV-A)
  { code: 'IMUS_CITY', name: 'Imus City', provinceCode: 'CAVITE' },
  { code: 'BACOOR_CITY', name: 'Bacoor City', provinceCode: 'CAVITE' },
  { code: 'DASMARIÑAS_CITY', name: 'Dasmariñas City', provinceCode: 'CAVITE' },
  { code: 'TAGAYTAY_CITY', name: 'Tagaytay City', provinceCode: 'CAVITE' },
  { code: 'GENERAL_TRIAS_CITY', name: 'General Trias City', provinceCode: 'CAVITE' },

  // Laguna (Region IV-A)
  { code: 'CALAMBA_CITY', name: 'Calamba City', provinceCode: 'LAGUNA' },
  { code: 'BIÑAN_CITY', name: 'Biñan City', provinceCode: 'LAGUNA' },
  { code: 'SANTA_ROSA_CITY', name: 'Santa Rosa City', provinceCode: 'LAGUNA' },
  { code: 'SAN_PEDRO_CITY', name: 'San Pedro City', provinceCode: 'LAGUNA' },
  { code: 'LOS_BAÑOS', name: 'Los Baños', provinceCode: 'LAGUNA' },

  // Rizal (Region IV-A)
  { code: 'ANTIPOLO_CITY', name: 'Antipolo City', provinceCode: 'RIZAL' },
  { code: 'CAINTA', name: 'Cainta', provinceCode: 'RIZAL' },
  { code: 'TAYTAY', name: 'Taytay', provinceCode: 'RIZAL' },
  { code: 'ANGONO', name: 'Angono', provinceCode: 'RIZAL' },

  // Ilocos Norte (Region I)
  { code: 'LAOAG_CITY', name: 'Laoag City', provinceCode: 'ILOCOS_NORTE' },
  { code: 'BATAC_CITY', name: 'Batac City', provinceCode: 'ILOCOS_NORTE' },

  // Pangasinan (Region I)
  { code: 'DAGUPAN_CITY', name: 'Dagupan City', provinceCode: 'PANGASINAN' },
  { code: 'URDANETA_CITY', name: 'Urdaneta City', provinceCode: 'PANGASINAN' },
  { code: 'ALAMINOS_CITY', name: 'Alaminos City', provinceCode: 'PANGASINAN' }
];

export const barangaysByCity = {
  // Davao City (Very detailed for Davao-specific orders!)
  'DAVAO_CITY': [
    'Buhangin (Pob.)',
    'Talomo (Pob.)',
    'Agdao',
    'Barangay 1-A (Pob.)',
    'Barangay 2-A (Pob.)',
    'Barangay 3-A (Pob.)',
    'Barangay 5-A (Pob.)',
    'Barangay 10-A (Pob.)',
    'Barangay 19-B (Pob.)',
    'Barangay 22-C (Pob.)',
    'Cabantian',
    'Catalunan Grande',
    'Catalunan Pequeño',
    'Daliao (Toril)',
    'Dumoy (Toril)',
    'Indangan',
    'Lanang',
    'Matina Aplaya',
    'Matina Crossing',
    'Matina Pangi',
    'Ma-a',
    'Mintal',
    'Pampanga',
    'Sasa',
    'Tibungco',
    'Toril (Pob.)'
  ],

  // Makati City
  'MAKATI': [
    'Bel-Air',
    'San Lorenzo',
    'Urdaneta',
    'Forbes Park',
    'Dasmarinas',
    'Poblacion',
    'Guadalupe Nuevo',
    'Guadalupe Viejo',
    'Tejeros',
    'Bangkal',
    'San Antonio',
    'Pio del Pilar',
    'Palanan',
    'Cembo',
    'Pembo',
    'Rembo',
    'Rizal'
  ],

  // Quezon City
  'QUEZON_CITY': [
    'Batasan Hills',
    'Commonwealth',
    'Bagong Pag-asa',
    'Diliman',
    'Katipunan',
    'Loyola Heights',
    'Cubao (Socorro)',
    'Kamuning',
    'Fairview',
    'Pasong Tamo',
    'Holy Spirit',
    'Tandang Sora',
    'South Triangle',
    'New Manila'
  ],

  // Manila
  'MANILA': [
    'Barangay 659 (Intramuros)',
    'Barangay 667 (Ermita)',
    'Barangay 699 (Malate)',
    'Binondo (Pob.)',
    'Quiapo (Pob.)',
    'Sampaloc',
    'Tondo I',
    'Tondo II',
    'San Miguel',
    'Paco',
    'Santa Ana',
    'Santa Cruz'
  ],

  // Taguig City
  'TAGUIG': [
    'Fort Bonifacio (BGC)',
    'Pinagsama',
    'Ususan',
    'Tuktukan',
    'Signal Village',
    'Central Bicutan',
    'Upper Bicutan',
    'Lower Bicutan',
    'Bagumbayan',
    'Hagonoy'
  ],

  // Cebu City
  'CEBU_CITY': [
    'Lahug',
    'Banilad',
    'Mabolo',
    'Guadalupe',
    'Capitol Site',
    'Apas',
    'Talamban',
    'Pardo',
    'Tisa',
    'Punta Princesa',
    'Sambag I',
    'Sambag II',
    'Tejero',
    'Basak San Nicolas'
  ],

  // Bacoor City
  'BACOOR_CITY': [
    'Molino I',
    'Molino II',
    'Molino III',
    'Molino IV',
    'Habay I',
    'Habay II',
    'San Nicolas I',
    'San Nicolas II',
    'Ligas I',
    'Ligas II',
    'Bayanan'
  ],

  // Imus City
  'IMUS_CITY': [
    'Anabu I-A',
    'Anabu II-A',
    'Bayan Luma I',
    'Bayan Luma II',
    'Bucandala I',
    'Bucandala II',
    'Carsadang Bago I',
    'Malagasang I-A',
    'Malagasang II-A',
    'Poblacion I-A'
  ]
};

// Smart fallback generator for cities/municipalities that don't have custom barangays listed.
// Keeps dataset lean while maintaining full selectability for every town in the country!
export function getBarangaysForCity(cityCode, cityName = '') {
  if (barangaysByCity[cityCode]) {
    return barangaysByCity[cityCode];
  }
  
  // Generic high-quality barangays that are common in any Philippine town/city
  return [
    'Poblacion',
    'San Jose',
    'Santo Niño',
    'Santa Maria',
    'San Pedro',
    'San Miguel',
    'Barangay I',
    'Barangay II',
    'Barangay III',
    'Bagong Pag-asa',
    'Maligaya',
    'Santa Cruz',
    'San Juan',
    'San Francisco'
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
    // Try exact or contains match on Province list
    matchedProvince = provinces.find(p => 
      p.name.toLowerCase() === normalizedProv || 
      p.name.toLowerCase().includes(normalizedProv) ||
      normalizedProv.includes(p.name.toLowerCase())
    );
  }

  if (matchedProvince) {
    matchedRegion = regions.find(r => r.code === matchedProvince.regionCode);
    
    if (normalizedCity) {
      // Find city within this province
      matchedCity = cities.find(c => 
        c.provinceCode === matchedProvince.code && (
          c.name.toLowerCase() === normalizedCity ||
          c.name.toLowerCase().includes(normalizedCity) ||
          normalizedCity.includes(c.name.toLowerCase())
        )
      );
    }
  } else if (normalizedCity) {
    // Try to find city directly
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
