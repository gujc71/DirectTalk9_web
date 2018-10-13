import { createAction, handleActions } from 'redux-actions';
import {firestore, firebaseAuth, storage} from './Firestore';
import dateFormat from 'dateformat';

// action type
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';

const SNACKBAR = 'SNACKBAR';
const DIALOG = 'DIALOG';

const USER_SAVE = 'USERSAVE';
const USER_REMOVE = 'USERREMOVE';
const USER_LIST = 'USERLIST'; 
const USER_ADDS = 'USERADDS';
const USER_ADDPHOTO = 'USERADDPHOTO';

const ROOMS_SAVE = 'ROOMSSAVE';
const ROOMS_REMOVE = 'ROOMSREMOVE';
const ROOMS_READ = 'ROOMSREAD';
const ROOMS_LIST = 'ROOMSLIST'; 
const ROOMS_ADDS = 'ROOMSADDS';

const UNREADCOUNT = 'UNREADCOUNT';

const CHAT_SAVE = 'CHATSAVE';
const CHAT_REMOVE = 'CHATREMOVE';
const CHAT_LIST = 'CHATLIST'; 
const CHAT_ADDS = 'CHATADDS';
const CHAT_CLEAR = 'CHATCLEAR';
// ----------------------------------------------------------------------------
export const login = createAction(LOGIN);
export const logout = createAction(LOGOUT);

export const show_snackbar = createAction(SNACKBAR);
export const show_dialog = createAction(DIALOG);

export const user_save = createAction(USER_SAVE);
export const user_remove = createAction(USER_REMOVE);
export const user_list = createAction(USER_LIST);
export const user_adds = createAction(USER_ADDS);
export const user_addphoto = createAction(USER_ADDPHOTO);

export const rooms_save = createAction(ROOMS_SAVE);
export const rooms_remove = createAction(ROOMS_REMOVE);
export const rooms_read = createAction(ROOMS_READ);
export const rooms_list = createAction(ROOMS_LIST);
export const rooms_adds = createAction(ROOMS_ADDS);

export const setUnreadcount = createAction(UNREADCOUNT);

export const chat_save = createAction(CHAT_SAVE);
export const chat_remove = createAction(CHAT_REMOVE);
export const chat_list = createAction(CHAT_LIST);
export const chat_adds = createAction(CHAT_ADDS);
export const chat_clear = createAction(CHAT_CLEAR);

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
                        row.roomid = change.doc.id;
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
// =================================
export const firebase_find_chatroom = ( toUid = {}) => {
  return (dispatch, getState) => {
      const uid = getState().uid;
      const rooms = getState().rooms;

      rooms.map((row, inx) => {
        let roomusers = Object.keys(row.users);
        if (roomusers.length===2 & roomusers.indexOf(toUid)>-1 & roomusers.indexOf(uid)>-1) {
          dispatch(firebase_chat_list(row));
          return false;
        }
      })
  }
};

export const firebase_chat_list = (roomInfo) =>{
    return (dispatch, getState) => {
        dispatch(chat_clear());
        const uid = getState().uid;
        const roomid=roomInfo.roomid;
        let users=getState().users;
        let roomuserInfos = {};
        let roomusers = Object.keys(roomInfo.users);
        const roomusercnt = roomusers.length;
        roomusers.map(row => {
          let inx = users.findIndex(user => user.uid === row);
          if (inx >-1) {
            roomuserInfos[row] = {};
            roomuserInfos[row]["usernm"] = users[inx].usernm;
            roomuserInfos[row]["photourl"] = users[inx].photourl;
          }
          return row;
        })
        users = null;
        roomusers = null;

        dispatch(rooms_read(roomInfo));

        let ref = firestore.collection("rooms").doc(roomid).collection("messages");
        return ref.orderBy("timestamp")
                .onSnapshot(function(snapshot) {
                    var newlist = [];
                    snapshot.docChanges().forEach(function(change) {
                        var row = change.doc.data();
                        
                        if (change.type === "added") {
                            if (row.readUsers.indexOf(uid) === -1) {
                              row.readUsers.push(uid);
                              ref.doc(change.doc.id).update("readUsers", row.readUsers);
                            }
                            if (Number.isInteger(row.timestamp)) // it's temp because can't use serverTimestamp
                                 row.time = dateFormat(row.timestamp, "TT hh:MM")
                            else row.time = dateFormat(row.timestamp.toDate(), "TT hh:MM");                            
                            row.unreadcount = roomusercnt - row.readUsers.length;
                            row.userInfo = roomuserInfos[row.uid];

                            newlist.push(row);
                        } else
                        if (change.type === "modified") {
                            dispatch(chat_save(row));
                        } else
                        if (change.type === "removed") {
                            dispatch(chat_remove(row.uid));
                        }
                            
                    });
                    if (newlist.length>0){
                      dispatch(chat_adds(newlist));
                    }    
                });
    }
}


export const firebase_chat_remove = ( uid = {}) => {
    return (dispatch) => {
        return firestore.collection('rooms').doc(uid).delete();
    }
};

export const firebase_chat_save = ( data = {}) => {
    return (dispatch, getState) => {
        //var doc = firestore.collection('rooms').doc(getState().selectedRoom.roomid).collection("messages").doc();
        //data.uid = doc.id;
        data.timestamp = Date.now();  //
        firestore.collection('rooms').doc(getState().selectedRoom.roomid).collection("messages").add(data);
    }
};
// ----------------------------------------------------------------------------

const initialState = {
  uid: null,
  boards: [], 
  users: [],
  rooms: [],
  unreadcount: 0,
  chattings: [],
  selectedRoom: {},

  snackbarOpen: false,
  dialogOpen: false,
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
  },  
  [DIALOG]: (state, { payload: data }) => {
    return {...state, dialogOpen: data };
  },  
  // =================================
  [USER_LIST]: (state, { payload: data }) => {
    return {...state, users: data };
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
    return {...state, users: data.concat(users) };
  },
  [USER_REMOVE]: (state, { payload: uid }) => {
    let users = state.users;
    return {...state, users: users.filter(row => row.uid !== uid) };
  },
  [USER_ADDPHOTO]: (state, { payload: data }) => {
    let users = state.users;    
    let inx = users.findIndex(row => row.uid === data.uid);
    if (inx > -1) {         
      users[inx].photourl = data.photourl;
      return {...state, users: users};
    };
  },
  // =================================
  [ROOMS_LIST]: (state, { payload: data }) => {
    return {...state, rooms: data, selectedRoom: {} };
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
    return {...state, rooms: data.concat(rooms) };
  },
  [ROOMS_REMOVE]: (state, { payload: roomid }) => {
    let rooms = state.rooms;
    return {...state, rooms: rooms.filter(row => row.roomid !== roomid), selectedRoom: {} };
  },
  [ROOMS_READ]: (state, { payload: roomInfo }) => {
    return {...state, selectedRoom: roomInfo};    
  },
  [UNREADCOUNT]: (state, { payload: count }) => {
    return {...state, unreadcount: count};    
  }, 
  // =================================
  [CHAT_LIST]: (state, { payload: data }) => {
    return {...state, chattings: data };
  },
  [CHAT_SAVE]: (state, { payload: data }) => {
    let chattings = state.chattings;
    let inx = chattings.findIndex(row => row.uid === data.uid);
    if (inx===-1) {                                                       // new : Insert
      let newchattings = [{date: new Date(), ...data }]
      return {...state, chattings: newchattings.concat(chattings), uid: state.uid };
    } else {                                                              // Update
      return {...state, chattings: chattings.map(row => data.uid === row.uid ? {...data }: row) };
    }  
  },
  [CHAT_ADDS]: (state, { payload: data }) => {
    let chattings = state.chattings;
    return {...state, chattings: chattings.concat(data) };
  },
  [CHAT_REMOVE]: (state, { payload: uid }) => {
    let chattings = state.chattings;
    return {...state, chattings: chattings.filter(row => row.uid !== uid) };
  },
  [CHAT_CLEAR]: (state) => {
    return {...state, chattings: [] };
  },
  [UNREADCOUNT]: (state, { payload: count }) => {
    return {...state, unreadcount: count};  
  }  
}, initialState);


export default handleAction;

