const crops = [
  // 🌊 Coastal Region
  {
    name: 'Rice',
    reason: 'High humidity and coastal climate',
    icon: '🌾',
    region: 'Coastal',
    idealTemp: '20-30°C',
    idealHumidity: '>60%',
    idealRainfall: 'High'
  },
  {
    name: 'Coconut',
    reason: 'Thrives in coastal regions',
    icon: '🥥',
    region: 'Coastal',
    idealTemp: '25-35°C',
    idealHumidity: '60-90%',
    idealRainfall: 'High'
  },
  {
    name: 'Banana',
    reason: 'Warm and humid conditions',
    icon: '🍌',
    region: 'Coastal',
    idealTemp: '20-35°C',
    idealHumidity: '>60%',
    idealRainfall: 'Moderate-High'
  },

  // 🌵 Dry / Arid Region
  {
    name: 'Millets',
    reason: 'Low water requirement',
    icon: '🌾',
    region: 'Dry/Arid',
    idealTemp: '25-35°C',
    idealHumidity: '<50%',
    idealRainfall: 'Low'
  },
  {
    name: 'Pulses',
    reason: 'Drought resistant crops',
    icon: '🌱',
    region: 'Dry/Arid',
    idealTemp: '15-30°C',
    idealHumidity: '40-70%',
    idealRainfall: 'Low-Moderate'
  },
  {
    name: 'Cotton',
    reason: 'Suitable for dry climates',
    icon: '🧵',
    region: 'Dry/Arid',
    idealTemp: '21-37°C',
    idealHumidity: '<70%',
    idealRainfall: 'Moderate'
  },

  // 🌾 Plains Region
  {
    name: 'Wheat',
    reason: 'Cool to moderate temperature',
    icon: '🌾',
    region: 'Plains',
    idealTemp: '15-25°C',
    idealHumidity: '<60%',
    idealRainfall: 'Moderate'
  },
  {
    name: 'Sugarcane',
    reason: 'Fertile soil and irrigation',
    icon: '🎋',
    region: 'Plains',
    idealTemp: '20-35°C',
    idealHumidity: '60-85%',
    idealRainfall: 'High'
  },
  {
    name: 'Rice',
    reason: 'Plenty of water availability',
    icon: '🌾',
    region: 'Plains',
    idealTemp: '20-35°C',
    idealHumidity: '>70%',
    idealRainfall: 'High'
  },

  // 🏔️ Hilly Region
  {
    name: 'Apple',
    reason: 'Cool climate crop',
    icon: '🍎',
    region: 'Hilly',
    idealTemp: '10-20°C',
    idealHumidity: '60-80%',
    idealRainfall: 'Moderate'
  },
  {
    name: 'Potato',
    reason: 'Grows well in hilly regions',
    icon: '🥔',
    region: 'Hilly',
    idealTemp: '15-25°C',
    idealHumidity: '50-80%',
    idealRainfall: 'Moderate'
  },
  {
    name: 'Barley',
    reason: 'Cold tolerant crop',
    icon: '🌾',
    region: 'Hilly',
    idealTemp: '12-25°C',
    idealHumidity: '30-65%',
    idealRainfall: 'Moderate'
  },

  // 🌴 Tropical Region
  {
    name: 'Maize',
    reason: 'Adaptable to tropical climate',
    icon: '🌽',
    region: 'Tropical',
    idealTemp: '18-32°C',
    idealHumidity: '50-70%',
    idealRainfall: 'Moderate'
  },
  {
    name: 'Groundnut',
    reason: 'Warm weather crop',
    icon: '🥜',
    region: 'Tropical',
    idealTemp: '25-35°C',
    idealHumidity: '50-70%',
    idealRainfall: 'Low-Moderate'
  }
];

export default crops;
