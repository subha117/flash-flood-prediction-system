export const convertUnits = (value, type, settings) => {
  if (value == null || isNaN(value)) return "—";
  
  const isImperial = settings?.units === 'imperial';
  const val = Number(value);

  if (!isImperial) {
    if (type === 'temperature') return `${val.toFixed(1)}°C`;
    if (type === 'rainfall') return `${val.toFixed(1)} mm`;
    if (type === 'wind_speed') return `${val.toFixed(1)} km/h`;
    if (type === 'elevation') return `${val.toFixed(1)} m`;
    return val.toFixed(2);
  }

  // Convert to Imperial
  if (type === 'temperature') {
    const f = (val * 9/5) + 32;
    return `${f.toFixed(1)}°F`;
  }
  if (type === 'rainfall') {
    const inches = val / 25.4;
    return `${inches.toFixed(2)} in`;
  }
  if (type === 'wind_speed') {
    const mph = val * 0.621371;
    return `${mph.toFixed(1)} mph`;
  }
  if (type === 'elevation') {
    const feet = val * 3.28084;
    return `${feet.toFixed(1)} ft`;
  }
  
  return val.toFixed(2);
};

export const formatValueOnly = (value, type, settings) => {
  if (value == null || isNaN(value)) return "—";
  
  const isImperial = settings?.units === 'imperial';
  const val = Number(value);

  if (!isImperial) {
    return type === 'rainfall' ? val.toFixed(2) : val.toFixed(1);
  }

  if (type === 'temperature') return ((val * 9/5) + 32).toFixed(1);
  if (type === 'rainfall') return (val / 25.4).toFixed(2);
  if (type === 'wind_speed') return (val * 0.621371).toFixed(1);
  if (type === 'elevation') return (val * 3.28084).toFixed(1);

  return val.toFixed(2);
};
export const getUnitSymbol = (type, settings) => {
  const isImperial = settings?.units === 'imperial';
  if (!isImperial) {
    if (type === 'temperature') return '°C';
    if (type === 'rainfall') return 'mm';
    if (type === 'wind_speed') return 'km/h';
    if (type === 'elevation') return 'm';
    return '';
  }
  if (type === 'temperature') return '°F';
  if (type === 'rainfall') return 'in';
  if (type === 'wind_speed') return 'mph';
  if (type === 'elevation') return 'ft';
  return '';
};
