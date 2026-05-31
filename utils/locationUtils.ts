// LocationUtils - used on the frontPage to calculate nearest snatches
export interface PostalCode {
  tekst: string;
  postnummer: {
    nr: string;
    navn: string;
  };
}

export interface Address {
  tekst: string;
  adresse: {
    id: string;
    vejnavn: string;
    husnr: string;
    etage: string | null;
    dør: string | null;
    postnr: string;
    postnrnavn: string;
    x: number;
    y: number;
  };
}

// Searches postalCodes from an extern API with the specific postal code query
export async function searchPostalCodes(query: string): Promise<PostalCode[]> {
  if (!query || query.length < 2) return [];

  const response = await fetch(
    `https://api.dataforsyningen.dk/postnumre/autocomplete?q=${query}&per_side=5`,
  );
  const data = await response.json();
  return data;
}

// Searches adresses from an extern API with the specific adress query
export async function searchAdresses(query: string): Promise<Address[]> {
  if (!query || query.length < 2) return [];

  const response = await fetch(
    `https://api.dataforsyningen.dk/adresser/autocomplete?q=${query}&per_side=5`,
  );

  const result = await response.json();
  return result;
}

// Takes to coordinates and returns the distance in KM
export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Takes the distance in km and formats it to a string
function formatDistance(distanceInKm: number): string {
  const meters = Math.round(distanceInKm * 1000);

  if (meters < 100) return "Under 100 m væk";
  if (meters < 250) return "Under 250 m væk";
  if (meters < 500) return "Under 500 m væk";
  if (meters < 1000) return "Under 1 km væk";
  return `${distanceInKm.toFixed(1)} km væk`;
}

// Convenience function that uses the formatDistance() and getDistanceInKm() functions
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): string {
  return formatDistance(getDistanceInKm(lat1, lon1, lat2, lon2));
}
