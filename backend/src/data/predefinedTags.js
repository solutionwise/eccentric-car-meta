// Comprehensive predefined automotive tags for CLIP-based auto-tagging
// Each category contains extensive options for accurate vehicle classification

const predefinedTags = {
  colors: [
    // Primary colors
    'red', 'blue', 'white', 'black', 'silver', 'gray', 'grey', 'green', 'yellow', 'orange',
    // Extended colors
    'purple', 'brown', 'gold', 'bronze', 'maroon', 'navy', 'beige', 'cream', 'pink', 'turquoise',
    // Metallic variations
    // 'metallic red', 'metallic blue', 'metallic silver', 'metallic black', 'metallic gray',
    // 'metallic green', 'metallic gold', 'metallic bronze', 'pearl white', 'pearl black',
    // Specialty colors
    // 'champagne', 'copper', 'gunmetal', 'charcoal', 'midnight blue', 'forest green',
    // 'crimson', 'scarlet', 'burgundy', 'royal blue', 'sky blue', 'electric blue',
    // 'lime green', 'emerald', 'olive', 'tan', 'khaki', 'ivory', 'platinum'
  ],

  types: [
    // Standard vehicle types
    'sedan', 'suv', 'truck', 'convertible', 'hatchback', 'coupe', 'wagon', 'minivan',
    // Extended types
    // 'pickup', 'crossover', 'sports car', 'luxury car', 'supercar', 'muscle car',
    // 'electric car', 'hybrid', 'roadster', 'cabriolet', 'estate', 'limousine',
    // // Commercial vehicles
    // 'van', 'bus', 'motorhome', 'rv', 'trailer', 'semi truck', 'delivery truck',
    // // Specialty vehicles
    // 'off-road vehicle', 'atv', 'utv', 'golf cart', 'go-kart', 'race car',
    // 'classic car', 'vintage car', 'antique car', 'kit car', 'replica car',
    // // Body styles
    // 'fastback', 'hardtop', 'soft top', 'targa', 'shooting brake', 'liftback',
    // 'notchback', 'kammback', 'sloping roofline', 'boxy', 'aerodynamic'
  ],

  features: [
    'sunroof', 'leather', 'alloy wheels', 'rear spoiler', 'front spoiler'
    // Exterior features
    // 'sunroof', 'moonroof', 'panoramic roof', 'leather', 'alloy wheels', 'chrome wheels',
    // 'spoiler', 'rear spoiler', 'front spoiler', 'side skirts', 'body kit',
    // Interior features
    // 'leather seats', 'premium interior', 'wood trim', 'carbon fiber', 'aluminum trim',
    // 'heated seats', 'cooled seats', 'ventilated seats', 'massage seats', 'memory seats',
    // // Technology features
    // 'navigation', 'gps', 'bluetooth', 'wireless charging', 'usb ports', 'aux input',
    // 'premium sound', 'bose audio', 'harman kardon', 'bang olufsen', 'surround sound',
    // // Safety features
    // 'backup camera', 'parking sensors', 'adaptive cruise control', 'lane assist',
    // 'blind spot monitoring', 'collision warning', 'automatic emergency braking',
    // 'night vision', 'head-up display', '360 camera', 'parking assist',
    // // Performance features
    // 'turbo', 'supercharger', 'v8', 'v6', 'v12', 'w12', 'diesel', 'electric', 'hybrid',
    // 'all-wheel drive', 'four-wheel drive', 'rear-wheel drive', 'front-wheel drive',
    // 'sport suspension', 'performance brakes', 'sport exhaust', 'launch control',
    // // Convenience features
    // 'automatic', 'manual', 'cvt', 'dual clutch', 'keyless entry', 'push button start',
    // 'remote start', 'climate control', 'dual zone', 'triple zone', 'air conditioning',
    // 'power windows', 'power locks', 'power mirrors', 'power seats', 'power steering',
    // 'cruise control', 'adaptive cruise', 'auto high beams', 'rain sensing wipers'
  ],

  brands: [
    // Mainstream brands
    'toyota', 'honda', 'bmw', 'ford', 'chevrolet', 'audi', 'mercedes',
    'volkswagen', 'nissan', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus', 'acura',
    'infiniti', 'cadillac', 'lincoln', 'jeep', 'ram', 'dodge', 'chrysler', 'buick', 'gmc',
    // Luxury brands
    'porsche', 'ferrari', 'lamborghini', 'mclaren', 'bentley', 'rolls royce',
    'maserati', 'alfa romeo', 'jaguar', 'land rover', 'volvo', 'saab', 'mini', 'smart',
    // Electric brands
    'tesla', 'rivian', 'lucid', 'polestar', 'nio', 'xpeng', 'li auto', 'byton',
    // Indian brands
    'tata', 'mahindra', 'maruti', 'maruti suzuki', 'hindustan', 'force motors',
    'ashok leyland', 'eicher', 'bajaj', 'isuzu india', 'toyota kirloskar', 'renault india',
    'hyundai india', 'kia india', 'mg motor india',
    // Performance brands
    // 'amg', 'm sport', 's line', 'f sport', 'type r', 'st', 'rs', 'gt', 'gtr',
    // Commercial brands
    // 'freightliner', 'peterbilt', 'kenworth', 'mack', 'international', 'isuzu', 'hino',
    // Classic/vintage brands
    // 'packard', 'studebaker', 'hudson', 'nash', 'willys', 'crosley', 'tucker'
  ],

  // Additional categories for comprehensive tagging
  // conditions: [
  //   'new', 'used', 'certified pre-owned', 'salvage', 'rebuilt', 'clean title',
  //   'accident free', 'one owner', 'multiple owners', 'fleet vehicle', 'rental car',
  //   'lease return', 'trade-in', 'auction', 'repossessed'
  // ],

  // years: [
  //   '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015',
  //   '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005',
  //   '2004', '2003', '2002', '2001', '2000', '1999', '1998', '1997', '1996', '1995',
  //   '1994', '1993', '1992', '1991', '1990', '1989', '1988', '1987', '1986', '1985',
  //   '1984', '1983', '1982', '1981', '1980', '1979', '1978', '1977', '1976', '1975',
  //   '1974', '1973', '1972', '1971', '1970', '1969', '1968', '1967', '1966', '1965',
  //   '1964', '1963', '1962', '1961', '1960', '1959', '1958', '1957', '1956', '1955',
  //   '1954', '1953', '1952', '1951', '1950', '1949', '1948', '1947', '1946', '1945',
  //   '1944', '1943', '1942', '1941', '1940', '1939', '1938', '1937', '1936', '1935',
  //   '1934', '1933', '1932', '1931', '1930', '1929', '1928', '1927', '1926', '1925'
  // ],

  // priceRanges: [
  //   'under 10000', 'under 15000', 'under 20000', 'under 25000', 'under 30000',
  //   'under 35000', 'under 40000', 'under 50000', 'under 60000', 'under 70000',
  //   'under 80000', 'under 90000', 'under 100000', 'over 100000', 'over 150000',
  //   'over 200000', 'over 300000', 'over 500000', 'over 1000000'
  // ],

  // fuelTypes: [
  //   'gasoline', 'diesel', 'electric', 'hybrid', 'plug-in hybrid', 'hydrogen',
  //   'natural gas', 'propane', 'ethanol', 'biodiesel', 'flex fuel'
  // ],

  // transmissions: [
  //   'automatic', 'manual', 'cvt', 'dual clutch', 'semi-automatic', 'tiptronic',
  //   'paddle shifters', 'sequential', 'automated manual'
  // ],

  // driveTypes: [
  //   'front-wheel drive', 'rear-wheel drive', 'all-wheel drive', 'four-wheel drive',
  //   'part-time four-wheel drive', 'full-time four-wheel drive', 'intelligent all-wheel drive'
  // ]
};

// Helper function to get all concepts for CLIP classification
function getAllConcepts() {
  const concepts = [];
  
  // Add vehicle types
  predefinedTags.types.forEach(type => {
    concepts.push(`a photo of a ${type}`);
  });
  
  // Add colors with car context
  predefinedTags.colors.forEach(color => {
    concepts.push(`a photo of a ${color} car`);
  });
  
  // Add features with car context
  predefinedTags.features.forEach(feature => {
    concepts.push(`a photo of a car with ${feature}`);
  });
  
  // Add brands with car context (improved descriptions for better detection)
  predefinedTags.brands.forEach(brand => {
    concepts.push(`a photo of a ${brand} car`);
    concepts.push(`a ${brand} vehicle`);
    concepts.push(`a ${brand} automobile`);
  });
  
  // Add general automotive concepts
  // concepts.push(
  //   'a photo of a car',
  //   'a photo of a vehicle',
  //   'a photo of an automobile',
  //   'a photo of a racing car',
  //   'a photo of a sports car',
  //   'a photo of a luxury car',
  //   'a photo of a family car',
  //   'a photo of a modern car',
  //   'a photo of a classic car',
  //   'a photo of an electric car',
  //   'a photo of a hybrid car',
  //   'a photo of a vintage car',
  //   'a photo of a new car',
  //   'a photo of a used car'
  // );
  
  return concepts;
}

// Helper function to extract tag from concept
function extractTagFromConcept(concept) {
  // Remove "a photo of a" prefix
  let tag = concept.replace(/^a photo of a /, '');
  
  // Remove "a" prefix for vehicle/automobile descriptions
  tag = tag.replace(/^a /, '');
  
  // Remove "car", "vehicle", "automobile" suffixes
  tag = tag.replace(/ (car|vehicle|automobile)$/, '');
  tag = tag.replace(/ with /, ' ');
  
  return tag.trim();
}

// Helper function to categorize a tag
function categorizeTag(tag) {
  const tagLower = tag.toLowerCase();
  
  if (predefinedTags.colors.some(color => color.toLowerCase() === tagLower)) {
    return 'color';
  }
  if (predefinedTags.types.some(type => type.toLowerCase() === tagLower)) {
    return 'type';
  }
  if (predefinedTags.features.some(feature => feature.toLowerCase() === tagLower)) {
    return 'feature';
  }
  if (predefinedTags.brands.some(brand => brand.toLowerCase() === tagLower)) {
    return 'brand';
  }
  
  
  return 'other';
}

module.exports = {
  predefinedTags,
  getAllConcepts,
  extractTagFromConcept,
  categorizeTag
};
