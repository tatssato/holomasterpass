import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import Login from './pages/Login';
import Passwords from './pages/Passwords';
import API from './pages/API';

function App () {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Login} exact />
        <Route path="/passwords" component={Passwords} />
        <Route path="/api" component={API
        } />
      </Switch>
    </Router>
  );
}

export default App;