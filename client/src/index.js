import React from 'react';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import App from './App';
import store from './store.js';
// import api from './services/api.js';


/**
 * now
 * using token from local storage
 * see /services/api.js
 * */
// api.interceptors.request.use(req => {
//   let token = store.getState().user.token;
//   req.headers.authorization = `Bearer ${token}`;
//   return req;
// });

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);


