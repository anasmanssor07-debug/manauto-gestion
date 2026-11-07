export interface CarImagePreset {
  brand: string;
  model: string;
  category: string;
  imageUrl: string;
  suggestedRate: number;
  fuel: 'Diesel' | 'Essence' | 'Hybride' | 'Électrique';
  transmission: 'Manuelle' | 'Automatique';
  keywords?: string[];
}

export const CAR_IMAGE_PRESETS: CarImagePreset[] = [
  // DACIA
  {
    brand: 'Dacia',
    model: 'Logan',
    category: 'Économique / Berline',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 220,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['logan', 'dacia logan', 'dacia']
  },
  {
    brand: 'Dacia',
    model: 'Sandero Stepway',
    category: 'Crossover Citadin',
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 240,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['sandero', 'stepway', 'dacia sandero']
  },
  {
    brand: 'Dacia',
    model: 'Duster 4x4',
    category: 'SUV / Baroudeur',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 350,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['duster', 'dacia duster', '4x4']
  },
  {
    brand: 'Dacia',
    model: 'Jogger',
    category: 'Familiale 7 Places',
    imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 380,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['jogger', 'dacia jogger']
  },

  // RENAULT
  {
    brand: 'Renault',
    model: 'Clio 5',
    category: 'Citadine Polyvalente',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 250,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['clio', 'clio 5', 'clio 4', 'renault clio', 'renault']
  },
  {
    brand: 'Renault',
    model: 'Megane 4',
    category: 'Compacte',
    imageUrl: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 350,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['megane', 'renault megane', 'megane 4']
  },
  {
    brand: 'Renault',
    model: 'Captur',
    category: 'SUV Urbain',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 320,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['captur', 'renault captur']
  },
  {
    brand: 'Renault',
    model: 'Express',
    category: 'Utilitaire / Van',
    imageUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 280,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['express', 'kangoo', 'renault express']
  },

  // PEUGEOT
  {
    brand: 'Peugeot',
    model: '208',
    category: 'Citadine Moderne',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 280,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['208', 'peugeot 208', 'peugeot']
  },
  {
    brand: 'Peugeot',
    model: '2008',
    category: 'SUV Compact',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 380,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['2008', 'peugeot 2008']
  },
  {
    brand: 'Peugeot',
    model: '308',
    category: 'Berline Compacte',
    imageUrl: 'https://images.unsplash.com/photo-1541348263662-e0c866661ba5?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 370,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['308', 'peugeot 308']
  },
  {
    brand: 'Peugeot',
    model: '3008',
    category: 'SUV Premium',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 500,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['3008', 'peugeot 3008', '5008']
  },

  // VOLKSWAGEN
  {
    brand: 'Volkswagen',
    model: 'Golf 8',
    category: 'Compacte Sport',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 450,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['golf', 'golf 8', 'golf 7', 'volkswagen golf', 'vw golf', 'vw', 'volkswagen']
  },
  {
    brand: 'Volkswagen',
    model: 'Polo',
    category: 'Citadine',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 300,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['polo', 'vw polo', 'volkswagen polo']
  },
  {
    brand: 'Volkswagen',
    model: 'T-Roc',
    category: 'Crossover',
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 480,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['t-roc', 'troc', 'volkswagen t-roc']
  },
  {
    brand: 'Volkswagen',
    model: 'Tiguan',
    category: 'SUV Familial',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 650,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['tiguan', 'touareg', 'volkswagen tiguan']
  },
  {
    brand: 'Volkswagen',
    model: 'Touareg',
    category: 'Grand SUV Luxe',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 1100,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['touareg', 'vw touareg']
  },

  // HYUNDAI
  {
    brand: 'Hyundai',
    model: 'Tucson',
    category: 'SUV Élégant',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 550,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['tucson', 'hyundai tucson', 'hyundai']
  },
  {
    brand: 'Hyundai',
    model: 'Accent',
    category: 'Berline Économique',
    imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 260,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['accent', 'hyundai accent', 'elantra']
  },
  {
    brand: 'Hyundai',
    model: 'i10',
    category: 'Micro Citadine',
    imageUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 200,
    fuel: 'Essence',
    transmission: 'Manuelle',
    keywords: ['i10', 'i20', 'hyundai i10', 'grand i10']
  },

  // KIA
  {
    brand: 'Kia',
    model: 'Sportage',
    category: 'SUV Dynamique',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 580,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['sportage', 'kia sportage', 'kia']
  },
  {
    brand: 'Kia',
    model: 'Picanto',
    category: 'Mini Citadine',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 220,
    fuel: 'Essence',
    transmission: 'Manuelle',
    keywords: ['picanto', 'kia picanto', 'rio']
  },

  // CITROËN
  {
    brand: 'Citroën',
    model: 'C3',
    category: 'Citadine Confort',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 230,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['c3', 'citroen c3', 'citroen', 'citroën', 'c-elysee', 'c4']
  },
  {
    brand: 'Citroën',
    model: 'C4',
    category: 'Berline Crossover',
    imageUrl: 'https://images.unsplash.com/photo-1541348263662-e0c866661ba5?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 350,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['c4', 'citroen c4']
  },

  // FIAT
  {
    brand: 'Fiat',
    model: '500 Hybrid',
    category: 'Citadine Iconique',
    imageUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 260,
    fuel: 'Hybride',
    transmission: 'Automatique',
    keywords: ['500', 'fiat 500', 'fiat', 'tipo', 'panda']
  },

  // TOYOTA
  {
    brand: 'Toyota',
    model: 'Yaris Hybrid',
    category: 'Hybride Citadine',
    imageUrl: 'https://images.unsplash.com/photo-1590362891988-372990098f6d?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 270,
    fuel: 'Hybride',
    transmission: 'Automatique',
    keywords: ['yaris', 'toyota yaris', 'toyota', 'corolla']
  },
  {
    brand: 'Toyota',
    model: 'RAV4 Hybrid',
    category: 'SUV Hybride 4x4',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 650,
    fuel: 'Hybride',
    transmission: 'Automatique',
    keywords: ['rav4', 'toyota rav4', 'prado', 'land cruiser']
  },

  // CUPRA & SEAT
  {
    brand: 'Cupra',
    model: 'Formentor',
    category: 'Sport / SUV Coupé',
    imageUrl: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 650,
    fuel: 'Essence',
    transmission: 'Automatique',
    keywords: ['formentor', 'cupra', 'cupra formentor']
  },
  {
    brand: 'Seat',
    model: 'Ibiza',
    category: 'Citadine Sportive',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 260,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    keywords: ['ibiza', 'seat ibiza', 'seat', 'leon', 'arona']
  },

  // MERCEDES-BENZ
  {
    brand: 'Mercedes-Benz',
    model: 'Classe A 200',
    category: 'Luxe / Compacte Prestige',
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 750,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['classe a', 'mercedes classe a', 'mercedes', 'a200', 'a220', 'cla']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'Classe C 220d',
    category: 'Berline Affaires Luxe',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 950,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['classe c', 'mercedes classe c', 'c220', 'classe e']
  },
  {
    brand: 'Mercedes-Benz',
    model: 'GLC Coupé',
    category: 'SUV Prestige',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 1300,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['glc', 'mercedes glc', 'gle', 'gla']
  },

  // BMW
  {
    brand: 'BMW',
    model: 'Série 1',
    category: 'Compacte Sport Premium',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 700,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['serie 1', 'série 1', 'bmw serie 1', 'bmw', '118d', '120d']
  },
  {
    brand: 'BMW',
    model: 'Série 3 / 4',
    category: 'Berline Sport Luxe',
    imageUrl: 'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 900,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['serie 3', 'série 3', 'bmw serie 3', 'serie 4', '320d', '420d']
  },
  {
    brand: 'BMW',
    model: 'X5 M-Sport',
    category: 'Grand SUV Prestige',
    imageUrl: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 1400,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['x5', 'bmw x5', 'x3', 'x6', 'x1']
  },

  // AUDI
  {
    brand: 'Audi',
    model: 'A3 Sportback',
    category: 'Compacte Premium',
    imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 700,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['a3', 'audi a3', 'audi', 'a1']
  },
  {
    brand: 'Audi',
    model: 'Q3 / Q5',
    category: 'SUV Premium',
    imageUrl: 'https://images.unsplash.com/photo-1541348263662-e0c866661ba5?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 950,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['q3', 'q5', 'audi q3', 'audi q5', 'q7', 'q8']
  },

  // RANGE ROVER
  {
    brand: 'Range Rover',
    model: 'Evoque',
    category: 'SUV Prestige',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 1100,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['evoque', 'range rover', 'range rover evoque', 'land rover', 'velar', 'defender', 'sport']
  },

  // JEEP
  {
    brand: 'Jeep',
    model: 'Renegade',
    category: 'SUV 4x4',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    suggestedRate: 450,
    fuel: 'Diesel',
    transmission: 'Automatique',
    keywords: ['jeep', 'renegade', 'compass', 'wrangler']
  }
];

/**
 * Automatically find the best matching car image based on details entered by the user
 */
export function findMatchingCarImage(brand: string, model: string): {
  preset: CarImagePreset | null;
  imageUrl: string;
  isAutoMatched: boolean;
} {
  const cleanBrand = (brand || '').toLowerCase().trim();
  const cleanModel = (model || '').toLowerCase().trim();
  const fullSearch = `${cleanBrand} ${cleanModel}`.trim();

  if (!fullSearch) {
    return {
      preset: null,
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      isAutoMatched: false
    };
  }

  // 1. Exact or keyword match on both model & brand
  for (const preset of CAR_IMAGE_PRESETS) {
    if (preset.keywords) {
      for (const kw of preset.keywords) {
        if (cleanModel && (cleanModel.includes(kw) || kw.includes(cleanModel))) {
          return { preset, imageUrl: preset.imageUrl, isAutoMatched: true };
        }
        if (fullSearch.includes(kw) || kw.includes(fullSearch)) {
          return { preset, imageUrl: preset.imageUrl, isAutoMatched: true };
        }
      }
    }

    if (
      preset.brand.toLowerCase() === cleanBrand &&
      (preset.model.toLowerCase().includes(cleanModel) || cleanModel.includes(preset.model.toLowerCase()))
    ) {
      return { preset, imageUrl: preset.imageUrl, isAutoMatched: true };
    }
  }

  // 2. Match by Brand only if model didn't hit
  for (const preset of CAR_IMAGE_PRESETS) {
    if (preset.brand.toLowerCase() === cleanBrand || cleanBrand.includes(preset.brand.toLowerCase())) {
      return { preset, imageUrl: preset.imageUrl, isAutoMatched: true };
    }
  }

  // 3. Fallback default
  return {
    preset: null,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    isAutoMatched: false
  };
}

