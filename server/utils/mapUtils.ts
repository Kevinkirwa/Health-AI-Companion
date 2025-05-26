export function generateDirectionsUrl(
  destination: {
    address: string;
    latitude?: number;
    longitude?: number;
  },
  origin?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  }
): string {
  const baseUrl = 'https://www.google.com/maps/dir/?api=1';
  
  // If we have coordinates, use them for more accurate directions
  if (destination.latitude && destination.longitude) {
    const destinationParam = `${destination.latitude},${destination.longitude}`;
    const originParam = origin?.latitude && origin?.longitude
      ? `${origin.latitude},${origin.longitude}`
      : '';

    return `${baseUrl}&destination=${destinationParam}${originParam ? `&origin=${originParam}` : ''}`;
  }

  // Fallback to address-based directions
  const destinationParam = encodeURIComponent(destination.address);
  const originParam = origin?.address ? `&origin=${encodeURIComponent(origin.address)}` : '';

  return `${baseUrl}&destination=${destinationParam}${originParam}`;
} 