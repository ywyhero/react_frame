import React from 'react';
import ReactDOM from 'react-dom';
import '@/assets/css/common.less';
import Router from '@/router/index';
import '@/util/rem'
import 'antd-mobile/dist/antd-mobile.css'
import  {Provider} from 'mobx-react'
import store from './store/index'
import * as serviceWorker from './serviceWorker';

const search = window.location.search.substr(1);
const searchs = search.split('&');
let isDebug = false;
for(let key of searchs) {
  if(key.includes('isDebug')) {
    const keys = key.split('=');
    if(keys[1] === "true"){
      isDebug = true
    }
  }
}
if (window.location.href.includes("-dev.peilian.com") || isDebug)  {
  const VConsole=  require('vconsole')
  new VConsole();
}

ReactDOM.render(
  <Provider store={store}>
    <Router/>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
