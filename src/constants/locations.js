export const cities = {
  bengaluru: {
    label: 'Bengaluru',
    areas: [
      'Whitefield', 'Koramangala', 'Indiranagar', 'JP Nagar',
      'Vijayanagar', 'Jayanagar', 'HSR Layout', 'Sarjapur Road',
      'MG Road', 'Yelahanka', 'Electronic City', 'Marathahalli',
      'BTM Layout', 'Banashankari', 'Malleshwaram', 'Rajajinagar',
      'Hebbal',
    ],
  },
  chennai: {
    label: 'Chennai',
    areas: [
      'Anna Nagar', 'T. Nagar', 'Adyar', 'Velachery',
      'OMR', 'Guindy', 'Alwarpet', 'Mylapore', 'Besant Nagar',
    ],
  },
  mysuru: {
    label: 'Mysuru',
    areas: [
      'Gokulam', 'Jayalakshmipuram', 'Kuvempunagar', 'Vijayanagar',
      'Saraswathipuram', 'Hebbal Mysuru', 'Yadavagiri',
    ],
  },
  hyderabad: {
    label: 'Hyderabad',
    areas: [
      'Hitec City', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills',
      'Kondapur', 'Madhapur', 'Kukatpally',
    ],
  },
  mumbai: {
    label: 'Mumbai',
    areas: [
      'Bandra', 'Andheri', 'Juhu', 'Powai', 'Worli', 'Thane', 'Navi Mumbai',
    ],
  },
};

export const defaultCity = 'bengaluru';
export const defaultArea = 'Koramangala';

export function getCityLabel(cityId) {
  return cities[cityId]?.label || cityId;
}

export function getAreaLabel(cityId, area) {
  return area || getCityLabel(cityId);
}
