import supertest from 'supertest';
import app from '../app.js';
import db from '../db';
import {
  createUser,
  newTestUser,
  existingTestUser,
  deleteTestUser,
} from './testHelpers.js';
import {customAlphabet, urlAlphabet} from 'nanoid';

const api = supertest(app);
let token;

const nanoid = customAlphabet(urlAlphabet, 10);
const createKey = (filename) => {
  const dotIndex = filename.lastIndexOf('.');
  return filename.slice(0, dotIndex) + '_' + nanoid() +
    filename.slice(dotIndex);
};
// const path = 'D:\\projects\\car_sharing\\car.jpg';
// eslint-disable-next-line no-unused-vars
// const preview = global.URL.createObjectURL(path);

const newListing = {
  plate: 'xyz',
  make: 'abc',
  model: 'foo',
  year: '1901',
  transmission: 'M', // TODO add constraint in db
  seat_number: '4', // TODO add constraint in db
  large_bags_number: '2', // TODO add constraint in db
  category: 'Small',
  miles_per_rental: '', // TODO add constraint in db
  active: false,
  images: [createKey('car.jpg'), createKey('car.jpg')],
};

const newLocation = {
  addr_line2: 'unit 300',
  addr_line1: '4000 German Springs Rd',
  zipcode: '90001',
};
let newListingId;
let newLocationId;

const createListing = async (newListing) => {
  return await api.post('/api/listing/create').
    set('Authorization', `Bearer ${token}`).
    send(newListing);
};

describe('new listing', () => {
  
  beforeAll(async () => {
    await createUser(newTestUser);
    const response = await api.post('/api/user/login').send(existingTestUser);
    token = response.body.token;
    
  });
  
  test('can be created when valid by authorized user', async () => {
    const response = await createListing(newListing);
    
    // console.log('listing response', response.body);
    
    expect(response.status).toBe(200);
    // console.log('listing ERR:', response.body.error);
    
    expect(response.body.listing).toHaveProperty('id');
    newListingId = response.body.listing.id;
    expect(response.body).toHaveProperty('keysToUrls');
    // console.log('keysToUrls', response.body.keysToUrls);
    // console.log('type', typeof response.body.keysToUrls);
    // console.log('keysToUrls value0',
    //   response.body.keysToUrls[newListing.images[0]]);
    
    expect(response.body.keysToUrls[newListing.images[0]]).toBeDefined();
    expect(response.body.keysToUrls[newListing.images[1]]).toBeDefined();
    
    // listing from db
    let listingFromDb;
    try {
      listingFromDb = await db.one('select plate from listing where id=$1',
        [response.body.listing.id]);
    } catch (e) {
      // console.log('can be created when valid ERROR from db:', e);
    }
    expect(listingFromDb.plate).toEqual(newListing.plate.toUpperCase());
  });
  
  test('can be fetched in /get-host-listings', async () => {
    const result = await api.get('/api/listing/get-host-listings').
      set('Authorization', `Bearer ${token}`).
      query({fromDate: new Date(), toDate: new Date()});
    console.log('/get-host-listings result.error', result.error);
    expect(result.statusCode).toEqual(200);
    expect(result.body.listings).
      toEqual(expect.arrayContaining(
        [expect.objectContaining({plate: newListing.plate.toUpperCase()})],
      ));
  });
  
  test('can add new location', async () => {
    const result = await api.post('/api/listing/add-location').
      set('Authorization', `Bearer ${token}`).
      send({newLocation});
    
    expect(result.statusCode).toEqual(200);
    expect(result.body.location.addr_line1).toEqual(newLocation.addr_line1);
    expect(result.body.location.id).toBeDefined();
    newLocationId = result.body.location.id;
  });
  
  test('can update location, year, active, base_rate, fee in existing listing',
    async () => {
      const rowToSubmit = {
        id: newListingId,
        location_id: newLocationId,
        year: 2001,
        active: !newListing.active,
        base_rate: '99.00',
        fee: '29.00',
        miles_per_rental: 100,
      };
      const result = await api.post('/api/listing/update-listing').
        set('Authorization', `Bearer ${token}`).
        send(rowToSubmit);
      
      console.log('/api/listing/update-listing result error', result.error);
      expect(result.statusCode).toEqual(200);
      console.log('/api/listing/update-listing result.body', result.body);
      expect(result.body.listing_update).toMatchObject(rowToSubmit);
      
    });
  
  // TODO add test when reservation was made it should show valid values of 'num_days_rented' and 'sale_total'
  
  afterAll(async () => {
    await deleteTestUser(existingTestUser);
  });
});
