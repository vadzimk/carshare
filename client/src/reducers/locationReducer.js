import {setNotification} from './notificationReducer.js';
import locationService from '../services/locationService.js';

const locationReducer = (state = {countries: [], zip_city_state: {}, myLocations:[]}, action) => {
  switch (action.type) {
  case 'GET_ALL_COUNTRIES':
    return {...state, countries: action.payload};
  case 'GET_CITY_STATE_FOR_ZIP':
    return {...state, zip_city_state: action.payload};
  case 'CLEAR_CITY_STATE':
    return {...state, zip_city_state: {}};
  case 'NEW_LOCATION':
    return {...state, myLocations: [...state.myLocations, action.payload ] };
  default:
    return state;
  }
};

export const getAllCountries = () => {
  return async (dispatch) => {
    const {data: countries, success} = await locationService.getAllCountries();
    
    if (success) {
      dispatch({
        type: 'GET_ALL_COUNTRIES',
        payload: countries,
      });
    } else {
      dispatch(setNotification('Service unavailable', 'error'));
    }
    
  };
};

export const clearCityState=()=>{
  return (dispatch)=>{
    dispatch({
      type: 'CLEAR_CITY_STATE'
    });
  };
};

export const getCityStateForZip = (zipcode) => {
  return async (dispatch) => {
    const {data: zip_city_state, success, error} = await locationService.getCityStateForZip(zipcode);
    if (success) {
      dispatch({
        type: 'GET_CITY_STATE_FOR_ZIP',
        payload: zip_city_state,
      });
      console.log('dispatched zip_city_state', zip_city_state);
    } else {
      console.log('getCityStateForZip error', error);
      dispatch(setNotification(`${zipcode} is not serviced.\nOnly zip codes of California and Florida are serviced at this time`, 'error'));
    }
  };
};

export const createLocation = (newLocation, onSuccess = () => {
}) => {
  console.log('dispatched createLocation', newLocation);
  
  return async (dispatch) => {
    const {success, error, data} = await locationService.createLocation(
      newLocation);
    if (success) {
      dispatch({
        type: 'NEW_LOCATION',
        payload: data.location,
      });
      dispatch(setNotification(`${data.location.addr_line1} created`, 'success'));
      onSuccess();
    } else {
      dispatch(setNotification(error, 'error'));
    }
    onSuccess();
  };
};

export default locationReducer;