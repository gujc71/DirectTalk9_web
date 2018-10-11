import { createAction, handleActions } from 'redux-actions';
import {firestore, firebaseAuth, storage} from './Firestore';
import dateFormat from 'dateformat';

// action type
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';

const SNACKBAR = 'SNACKBAR';

const USER_SAVE = 'USERSAVE';
const USER_REMOVE = 'USERREMOVE';
const USER_READ = 'USERREAD';
const USER_LIST = 'USERLIST'; 
const USER_ADDS = 'USERADDS';
const USER_ADDPHOTO = 'USERADDPHOTO';

const ROOMS_SAVE = 'ROOMSSAVE';
const ROOMS_REMOVE = 'ROOMSREMOVE';
const ROOMS_READ = 'ROOMSREAD';
const ROOMS_LIST = 'ROOMSLIST'; 
const ROOMS_ADDS = 'ROOMSADDS';

const UNREADCOUNT = 'UNREADCOUNT';

// ----------------------------------------------------------------------------
export const login = createAction(LOGIN);
export const logout = createAction(LOGOUT);

export const show_snackbar = createAction(SNACKBAR);

export const user_save = createAction(USER_SAVE);
export const user_remove = createAction(USER_REMOVE);
export const user_read = createAction(USER_READ);
export const user_list = createAction(USER_LIST);
export const user_adds = createAction(USER_ADDS);
export const user_addphoto = createAction(USER_ADDPHOTO);

export const rooms_save = createAction(ROOMS_SAVE);
export const rooms_remove = createAction(ROOMS_REMOVE);
export const rooms_read = createAction(ROOMS_READ);
export const rooms_list = createAction(ROOMS_LIST);
export const rooms_adds = createAction(ROOMS_ADDS);

export const setUnreadcount = createAction(UNREADCOUNT);
// ----------------------------------------------------------------------------
export const firebase_login = (email, pw) =>{
  return firebaseAuth.signInWithEmailAndPassword(email, pw);
}

export function firebase_logout () {
  return (dispatch) => {
    firebaseAuth.signOut();
    dispatch(logout());
  }  
}

export const firebase_register = (email, pw) =>{
  return firebaseAuth.createUserWithEmailAndPassword(email, pw).then(function() {
    var uid = firebaseAuth.currentUser.uid;

    var user = {
      uid: uid,
      userid: email,
      usernm: email,
      usermsg: ''
    };
    firestore.collection('users').doc(uid).set(user);
    login(uid);
  })
}
// =================================
export const firebase_user_list = () =>{
    return (dispatch) => {
        return firestore.collection("users").orderBy("usernm", "desc")
                .onSnapshot(function(snapshot) {
                    var newlist = [];
                    snapshot.docChanges().forEach(function(change) {
                        var row = change.doc.data();
                        if (change.type === "added") {
                            row.uid = change.doc.id;
                            newlist.push(row);
                        } else
                        if (change.type === "modified") {
                            dispatch(user_save(row));
                        } else
                        if (change.type === "removed") {
                            dispatch(user_remove(row.uid));
                        }
                            
                    });
                    if (newlist.length>0) {
                      dispatch(user_adds(newlist));
                      newlist.map((user, inx) => {
                        if (user.userphoto) {
                            storage.child('userPhoto/'+user.userphoto).getDownloadURL()
                              .then(function(url) {
                                dispatch(user_addphoto({uid: user.uid, photourl:url}));
                              }).catch(function(error) {
                                console.log(error);
                              });
                        }      
                      });
                    }    
                });
    }
}

export const firebase_user_remove = ( uid = {}) => {
    return (dispatch) => {
        return firestore.collection('users').doc(uid).delete();
    }
};

export const firebase_user_save = ( data = {}) => {
    return (dispatch) => {
        if (!data.uid) {
            var doc = firestore.collection('users').doc();
            data.uid = doc.id;
            data.brddate = Date.now();
            return doc.set(data);
        } else {
            return firestore.collection('users').doc(data.uid).update(data);    
        }
    }
};
// =================================
export const firebase_rooms_list = () =>{
    return (dispatch, getState) => {
        const uid = getState().uid;
        let unreadcount = 0;

        return firestore.collection("rooms").where("users."+uid,">=", 0) //.where("capital", "==", true)
                .onSnapshot(function(snapshot) {
                    var newlist = [];
                    snapshot.docChanges().forEach(function(change) {
                        var row = change.doc.data();
                        if (change.type === "added") {
                            const roomusers = Object.keys(row.users);
                            if (!row.title & roomusers.length===2) {
                                const inx = roomusers.find(user => user !== uid);
                                if (inx){
                                  row.peer = inx;
                                }
                            } 
                            if (row.msg !=null) { // there are no last message
                              row.timestamp = dateFormat(row.timestamp.toDate (), "yyyy-mm-dd")
                              switch(row.msgtype){
                                  case "1": row.msg = "Image"; break;
                                  case "2": row.msg = "File"; break;
                              }
                            }   
                            row.count = row.users[uid];
                            unreadcount += row.count;

                            newlist.push(row);
                        } else
                        if (change.type === "modified") {
                            dispatch(rooms_save(row));
                        } else
                        if (change.type === "removed") {
                            dispatch(rooms_remove(row.uid));
                        }
                            
                    });
                    if (newlist.length>0){
                      dispatch(rooms_adds(newlist));
                      dispatch(setUnreadcount(unreadcount));
                    }    
                });
    }
}

export const firebase_rooms_remove = ( uid = {}) => {
    return (dispatch) => {
        return firestore.collection('rooms').doc(uid).delete();
    }
};

export const firebase_rooms_save = ( data = {}) => {
    return (dispatch) => {
        if (!data.uid) {
            var doc = firestore.collection('rooms').doc();
            data.uid = doc.id;
            data.brddate = Date.now();
            return doc.set(data);
        } else {
            return firestore.collection('rooms').doc(data.uid).update(data);    
        }
    }
};
// ----------------------------------------------------------------------------

const initialState = {
  uid: null,
  boards: [], 
  selectedBoard: {},
  users: [],
  rooms: [],
  unreadcount: 0,

  snackbarOpen: false,
  message: '', 
};

const handleAction = handleActions({
  [LOGIN]: (state, { payload: uid }) => {
    return {...initialState, uid: uid};
  },
  [LOGOUT]: (state) => {
    return initialState;
  },
  [SNACKBAR]: (state, { payload: data }) => {
    return {...state, snackbarOpen: data.snackbarOpen, message: data.message };
  },  // =================================
  [USER_LIST]: (state, { payload: data }) => {
    return {...state, users: data, selectedBoard: {} };
  },
  [USER_SAVE]: (state, { payload: data }) => {
    let users = state.users;
    let inx = users.findIndex(row => row.uid === data.uid);
    if (inx===-1) {                                                       // new : Insert
      let newusers = [{date: new Date(), ...data }]
      return {...state, users: newusers.concat(users), uid: state.uid };
    } else {                                                              // Update
      return {...state, users: users.map(row => data.uid === row.uid ? {...data }: row) };
    }  
  },
  [USER_ADDS]: (state, { payload: data }) => {
    let users = state.users;
    return {...state, users: data.concat(users), selectedBoard: {} };
  },
  [USER_REMOVE]: (state, { payload: uid }) => {
    let users = state.users;
    return {...state, users: users.filter(row => row.uid !== uid), selectedBoard: {} };
  },
  [USER_READ]: (state, { payload: uid }) => {
    let users = state.users;
    return {...state, selectedBoard: users.find(row => row.uid === uid)};
  },
  [USER_ADDPHOTO]: (state, { payload: data }) => {
    let users = state.users;    
    let inx = users.findIndex(row => row.uid === data.uid);
    if (inx > -1) {         
      users[inx].photourl = data.photourl;
      return {...state, users: users};
    };
  }, // =================================
  [ROOMS_LIST]: (state, { payload: data }) => {
    return {...state, rooms: data, selectedBoard: {} };
  },
  [ROOMS_SAVE]: (state, { payload: data }) => {
    let rooms = state.rooms;
    let inx = rooms.findIndex(row => row.uid === data.uid);
    if (inx===-1) {                                                       // new : Insert
      let newrooms = [{date: new Date(), ...data }]
      return {...state, rooms: newrooms.concat(rooms), uid: state.uid };
    } else {                                                              // Update
      return {...state, rooms: rooms.map(row => data.uid === row.uid ? {...data }: row) };
    }  
  },
  [ROOMS_ADDS]: (state, { payload: data }) => {
    let rooms = state.rooms;
    return {...state, rooms: data.concat(rooms), selectedBoard: {} };
  },
  [ROOMS_REMOVE]: (state, { payload: uid }) => {
    let rooms = state.rooms;
    return {...state, rooms: rooms.filter(row => row.uid !== uid), selectedBoard: {} };
  },
  [ROOMS_READ]: (state, { payload: uid }) => {
    let rooms = state.rooms;
    return {...state, selectedBoard: rooms.find(row => row.uid === uid)};    
  },
  [UNREADCOUNT]: (state, { payload: count }) => {
    return {...state, unreadcount: count};    
  }  
}, initialState);


export default handleAction;

