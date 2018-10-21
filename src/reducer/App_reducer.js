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

const CHAT_LIST = 'CHATLIST'; 
const CHAT_ADDS = 'CHATADDS';
const CHAT_INIT = 'CHATINIT';
const CHAT_SAVE = 'CHATSAVE';
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

export const chat_list = createAction(CHAT_LIST);
export const chat_adds = createAction(CHAT_ADDS);
export const chat_init = createAction(CHAT_INIT);
export const chat_save = createAction(CHAT_SAVE);

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
                            //row.uid = change.doc.id;
                            //console.log(row);
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

export const firebase_user_remove = ( uid) => {
    return (dispatch) => {
        return firestore.collection('users').doc(uid).delete();
    }
};

export const firebase_user_save = ( data) => {
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

        function cleaningdata (row, acttype) {
          const roomusers = Object.keys(row.users);
          if (roomusers.length===2) {
              const inx = roomusers.find(user => user !== uid);
              if (inx){
                row.peer = inx;
              }
          } 
          if (row.msg !=null) { // there are last message
            if (Number.isInteger(row.timestamp)) {                    // it's temp because can't use serverTimestamp
              row.timestamp = dateFormat(row.timestamp, "yyyy-mm-dd")
            } else {
              row.timestamp = dateFormat(row.timestamp.toDate(), "yyyy-mm-dd")
            }

            switch(row.msgtype){
                case "1": row.msg = "Image"; break;
                case "2": row.msg = "File"; break;
            }
          }   

          const selectedRoom = getState().selectedRoom;
          if (getState().selectedRoom.roomid === row.roomid) {      // current chatting room
            //if (row.users[uid]>0) 
            unreadcount -= selectedRoom.count;
            row.users[uid] = 0;
            firestore.collection('rooms').doc(row.roomid).update({users: row.users});  // read all my msg in a room
          } else {
            acttype ? unreadcount ++ : unreadcount += row.users[uid];
          }
          row.count = row.users[uid];

          return row;
        }

        return firestore.collection("rooms").where("users."+uid,">=", 0) 
                .onSnapshot(function(snapshot) {
                    var newlist = [];
                    snapshot.docChanges().forEach(function(change) {
                        var row = change.doc.data();
                        row.roomid = change.doc.id;

                        if (change.type === "added") {
                          row = cleaningdata (row);
                          newlist.push(row);
                        } else
                        if (change.type === "modified") {
                          row = cleaningdata (row, "u");
                          dispatch(rooms_save(row));
                          dispatch(setUnreadcount(unreadcount));
                        } else
                        if (change.type === "removed") {
                          dispatch(rooms_remove(row.roomid));
                        }
                    });
                    if (newlist.length>0){
                      dispatch(rooms_adds(newlist));
                      dispatch(setUnreadcount(unreadcount));
                    }    
                });
    }
}

export const firebase_rooms_save = ( roomdata, chatdata) => {
    return (dispatch) => {
        if (!roomdata.roomid) {       // make chatting room before send msg
          var title = roomdata.title;
          roomdata.title = null;
          roomdata.msg = chatdata.msg;            // last message
          roomdata.msgtype = chatdata.msgtype;
          roomdata.timestamp = Date.now();                // it's temp because can't use serverTimestamp

          var doc = firestore.collection('rooms').doc();
          doc.set(roomdata);

          roomdata.title = title;
          roomdata.roomid = doc.id;
          dispatch(firebase_chat_list(roomdata));

          dispatch(firebase_chat_save(chatdata));
        } else {
            firestore.collection('rooms').doc(roomdata.uid).update(roomdata);    
        }
    }
};
// =================================
export const firebase_make_chatroom = (toUsers) => {
  return (dispatch, getState) => {
      const uid = getState().uid;
      const users = getState().users;
      
      let makeRoomdata = {
        title: null,
        users: {}
      }
      toUsers.map(inx => {
        makeRoomdata.users[users[inx].uid] = 0;
      });
      makeRoomdata.users[uid] = 0;        
      dispatch(chat_init(makeRoomdata));

      var doc = firestore.collection('rooms').doc();
      doc.set(makeRoomdata);

      makeRoomdata.title = "Chatting";
      makeRoomdata.roomid = doc.id;
      dispatch(firebase_chat_list(makeRoomdata));
      dispatch(show_dialog(true) );    
  }
};

export const firebase_find_chatroom = ( toUser) => {
  return (dispatch, getState) => {
      const uid = getState().uid;
      const rooms = getState().rooms;
      
      const chattingroom = rooms.find(row => {
        let roomusers = Object.keys(row.users);
        return roomusers.length===2 & roomusers.indexOf(toUser.uid)>-1 & roomusers.indexOf(uid)>-1;
      });

      if (chattingroom) {
        chattingroom.title = toUser.usernm;
        dispatch(firebase_chat_list(chattingroom));
      } else {                                        // make chatting room
        let makeRoomdata = {
          title: toUser.usernm,
          users: {}
        }
        makeRoomdata.users[toUser.uid] = 0;
        makeRoomdata.users[uid] = 0;        
        dispatch(chat_init(makeRoomdata));            
      }
  }
};
var chatlistener;
export const firebase_chat_list = (roomInfo) =>{
    return (dispatch, getState) => {
        const uid = getState().uid;
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
        })
        users = null;
        roomusers = null;
        
        dispatch(chat_init(roomInfo));

        // read all my msg in a room
        roomInfo.users[uid] = 0;
        firestore.collection('rooms').doc(roomInfo.roomid).update({users: roomInfo.users});  

        if (chatlistener) chatlistener(); // release

        function cleaningchattingdata (row) {
          if (Number.isInteger(row.timestamp)) {                    // it's temp because can't use serverTimestamp
            row.time = dateFormat(row.timestamp, "TT hh:MM")
            row.date = dateFormat(row.timestamp, "yyyy-mm-dd")
          } else {
            row.time = dateFormat(row.timestamp.toDate(), "TT hh:MM");
            row.date = dateFormat(row.timestamp.toDate(), "yyyy-mm-dd");
          }
          row.unreadcount = roomusercnt - row.readUsers.length;
          row.userInfo = roomuserInfos[row.uid];
          return row;
        }

        let ref = firestore.collection("rooms").doc(roomInfo.roomid).collection("messages");
        chatlistener=ref.orderBy("timestamp")
                .onSnapshot(function(snapshot) {
                    var newlist = [];
                    snapshot.docChanges().forEach(function(change) {
                        var row = change.doc.data();
                        row.chatid= change.doc.id;

                        if (change.type === "added") {
                            if (row.readUsers.indexOf(uid) === -1) {
                              row.readUsers.push(uid);
                              ref.doc(change.doc.id).update("readUsers", row.readUsers);  // send read
                            }
                            newlist.push(cleaningchattingdata (row));
                        } else
                        if (change.type === "modified") {
                          dispatch(chat_save(cleaningchattingdata (row)));
                        } 
                    });
                    if (newlist.length>0){
                      dispatch(chat_adds(newlist));
                    }    
                });
    }
}


export const firebase_chat_remove = (uid) => {
    return (dispatch) => {
        return firestore.collection('rooms').doc(uid).delete();
    }
};

export const firebase_chat_save = (data) => {
    return (dispatch, getState) => {
      let uid = getState().uid;
      let selectedRoom = getState().selectedRoom;
      data.timestamp = Date.now();                                                    // it's temp because can't use serverTimestamp

      const ref = firestore.collection('rooms').doc(selectedRoom.roomid);
      ref.collection("messages").add(data);

      ref.get().then(function(doc) {
        let room = doc.data(); 
        let roomusers = room.users;
        for(var inx in roomusers) {
          if (inx!==uid) roomusers[inx]++;
        }

        ref.update({msg:data.msg, msgtype:data.msgtype, timestamp:data.timestamp, uid: uid, users: roomusers});
      })        
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
    if (!data) { // close
      if (chatlistener) chatlistener(); // release
      return {...state, dialogOpen: data, selectedRoom:{} };
    }  
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
      //let newusers = [{date: new Date(), ...data }]
      let newusers = [{date: new Date(), ...data }]
      return {...state, users: newusers.concat(users) };
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
    if (state.selectedRoom.roomid!==data.roomid){
      state.unreadcount ++;
    }

    let rooms = state.rooms;
    let inx = rooms.findIndex(row => row.roomid === data.roomid);
    if (inx===-1) {                                                       // new : Insert
      let newrooms = [{date: new Date(), ...data }]
      return {...state, rooms: newrooms.concat(rooms) };
    } else {                                                              // Update
      return {...state, rooms: rooms.map(row => data.roomid === row.roomid ? {...data }: row) };
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
  [CHAT_ADDS]: (state, { payload: data }) => {
    let chattings = state.chattings;
    return {...state, chattings: chattings.concat(data) };
  },
  [CHAT_INIT]: (state, { payload: room }) => {
    return {...state, chattings: [], selectedRoom: room };
  },
  [CHAT_SAVE]: (state, { payload: data }) => {
    let chattings = state.chattings;
    let inx = chattings.findIndex(row => row.chatid === data.chatid);
    if (inx>-1) {                                                     
      return {...state, chattings: chattings.map(row => data.chatid === row.chatid ? {...data }: row) };
    }  
  },  
  [UNREADCOUNT]: (state, { payload: count }) => {
    return {...state, unreadcount: count};  
  }  
}, initialState);


export default handleAction;

