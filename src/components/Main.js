import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import MySnackbar from "./mycom/MySnackbar";
import Menu from './menu/Menu';
import UserList from './UserList';
import RoomList from './RoomList';
import UserProfile from './UserProfile';
import SignIn from './SignIn'; 

import {login, firebase_user_list, firebase_rooms_list} from '../reducer/App_reducer';
import {firebaseAuth} from '../reducer/Firestore';

const styles = theme => ({
  root: { 
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    height: '92vh',    
  },
});

function PrivateRoute ({component: Component, uid, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => uid !==null
        ? <Component {...props} />
        : <Redirect to={{pathname: '/SignIn', state: {from: props.location}}} />}
    />
  )
}

function PublicRoute ({component: Component, uid, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => uid === null
        ? <Component {...props} />
        : <Redirect to='/' />}
    />
  )
}

class Main extends React.Component {
  state = {
    loading: true
  }
  
  componentDidMount () {
    this.removeListener = firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
           this.props.login(user.uid);
           this.props.firebase_user_list();
      }else this.props.login(null);
    })
  }
  
  componentWillReceiveProps(nextProps) {
    if (!this.state.loading & this.props.users.length===0) return;
    if (!this.state.loading) return;

    this.props.firebase_rooms_list();
    this.setState({loading: false});
  }

  componentWillUnmount () {
    this.removeListener()
  }
  
  render() {
    const { classes, uid } = this.props;
	
    return (
        <Router>
          <div className={classes.root}>
            <Menu/>
            <main className={classes.content}>
              <div className={classes.toolbar} />
              <Switch>
                <PrivateRoute uid={uid} exact path="/" component={UserList}/>
                <PrivateRoute uid={uid} path="/UserList" component={UserList}/>
                <PrivateRoute uid={uid} path="/RoomList" component={RoomList}/>
                <PrivateRoute uid={uid} path="/UserProfile" component={UserProfile}/>

                <PublicRoute uid={uid} path="/SignIn" component={SignIn}/>
                <PublicRoute uid={uid} component={NoMatch}/>
              </Switch>
            </main>
            <MySnackbar />
          </div>
        </Router>
    );
  }
}

const NoMatch = ({ location }) => (
  <div>
    <h3>
      No match url for <code>{location.pathname}</code>
    </h3>
  </div>
);

Main.propTypes = {
  classes: PropTypes.object.isRequired,
};

let mapStateToProps = (state) => {
    return {
      uid: state.uid,
      users: state.users,
    };
}

const mapDispatchToProps = dispatch => ({
  login: uid => dispatch(login(uid)),
  firebase_user_list: () => dispatch(firebase_user_list()),
  firebase_rooms_list: () => dispatch(firebase_rooms_list()),
})

export default connect(mapStateToProps, mapDispatchToProps) (withStyles(styles)(Main));



