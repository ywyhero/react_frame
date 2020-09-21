import {observable, action } from 'mobx';

const store = observable({
    count: 0
})

store.addCount = action(() => {
    store.count += 1
})

export default store