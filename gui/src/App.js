import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import Login from './pages/Login';
import Passwords from './pages/Passwords';

function App () {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Login} exact />
        <Route path="/passwords" component={Passwords} />
      </Switch>
    </Router>
  );
}

export default App;