import { createStore, applyMiddleware } from 'redux';
import thunk form 'redux-thunk';

const store = createStore(() => [], {}, applyMiddleware());

export default store;
