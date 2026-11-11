export type City = {
  name: string
  country: string
}

export const cities: City[] = [
  { name: 'Ahmedabad', country: 'India' },
  { name: 'Bengaluru', country: 'India' },
  { name: 'Chennai', country: 'India' },
  { name: 'Delhi', country: 'India' },
  { name: 'Hyderabad', country: 'India' },
  { name: 'Kolkata', country: 'India' },
  { name: 'Mumbai', country: 'India' },
  { name: 'Pune', country: 'India' },
  { name: 'Austin', country: 'United States' },
  { name: 'Boston', country: 'United States' },
  { name: 'Chicago', country: 'United States' },
  { name: 'Denver', country: 'United States' },
  { name: 'Los Angeles', country: 'United States' },
  { name: 'New York', country: 'United States' },
  { name: 'San Francisco', country: 'United States' },
  { name: 'Seattle', country: 'United States' },
  { name: 'Berlin', country: 'Germany' },
  { name: 'Dubai', country: 'United Arab Emirates' },
  { name: 'London', country: 'United Kingdom' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Sydney', country: 'Australia' },
  { name: 'Toronto', country: 'Canada' },
]

export function formatCity(city: City) {
  return `${city.name}, ${city.country}`
}
