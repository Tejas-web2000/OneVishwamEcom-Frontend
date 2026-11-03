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

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    selectedCity: load('vishwam_city', defaultCity),
    selectedArea: load('vishwam_area', defaultArea),
    detectStatus: 'idle',
  },
  reducers: {
    selectCity(state, action) {
      const cityId = action.payload;
      state.selectedCity = cityId;
      state.selectedArea = cities[cityId]?.areas[0] || defaultArea;
    },
    selectArea(state, action) {
      state.selectedCity = action.payload.city;
      state.selectedArea = action.payload.area;
    },
    setCity(state, action) {
      state.selectedCity = action.payload;
    },
    setArea(state, action) {
      state.selectedArea = action.payload;
    },
    setDetectStatus(state, action) {
      state.detectStatus = action.payload;
    },
  },
});

export const { selectCity, selectArea, setArea, setDetectStatus } = locationSlice.actions;
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
