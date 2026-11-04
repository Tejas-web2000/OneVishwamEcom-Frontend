import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { cities, defaultCity, defaultArea } from '../constants/locations';

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v : fallback;
  } catch {
    return fallback;
  }
}

const savedCity = load('vishwam_city', defaultCity);
const initialCity = cities[savedCity] ? savedCity : defaultCity;
const savedArea = load('vishwam_area', defaultArea);
const initialArea = cities[initialCity]?.areas?.includes(savedArea)
  ? savedArea
  : (cities[initialCity]?.areas?.[0] || defaultArea);

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    selectedCity: initialCity,
    selectedArea: initialArea,
    detectStatus: 'idle',
  },
  reducers: {
    selectCity(state, action) {
      const cityId = cities[action.payload] ? action.payload : defaultCity;
      state.selectedCity = cityId;
      state.selectedArea = cities[cityId]?.areas?.[0] || defaultArea;
    },
    selectArea(state, action) {
      const cityId = cities[action.payload.city] ? action.payload.city : defaultCity;
      state.selectedCity = cityId;
      state.selectedArea = action.payload.area;
    },
    setCity(state, action) {
      state.selectedCity = cities[action.payload] ? action.payload : defaultCity;
    },
    setArea(state, action) {
      state.selectedArea = action.payload;
    },
    setDetectStatus(state, action) {
      state.detectStatus = action.payload;
    },
  },
});

export const { selectCity, selectArea, setCity, setArea, setDetectStatus } = locationSlice.actions;
export default locationSlice.reducer;

export function useLocation() {
  const dispatch = useDispatch();
  const selectedCity = useSelector((s) => s.location.selectedCity);
  const selectedArea = useSelector((s) => s.location.selectedArea);
  const detectStatus = useSelector((s) => s.location.detectStatus);
  return {
    selectedCity,
    selectedArea,
    detectStatus,
    selectArea: (city, area) => dispatch(selectArea({ city, area })),
    selectCity: (cityId) => dispatch(selectCity(cityId)),
    setArea: (area) => dispatch(setArea(area)),
    setDetectStatus: (status) => dispatch(setDetectStatus(status)),
  };
}
