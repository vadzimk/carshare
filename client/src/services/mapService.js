import provider from '../leaflet/provider.js';


const getMapResults = async(where) => {
  const results = await provider.geoCoder.geocode(where);
  console.log(results.features[0]);
  return {
    success: true,
    data: [where], // TODO replace dummy
  };
};

export default {getMapResults};