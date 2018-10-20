import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import WorkIcon from '@material-ui/icons/PermIdentity';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import dateFormat from 'dateformat';
import Button from '@material-ui/core/Button';

import { connect } from 'react-redux';
import {firebase_chat_list} from '../reducer/App_reducer';
import ChatItem_Left from './mycom/ChatItem_Left';
import ChatItem_Right from './mycom/ChatItem_Right';


import './mycom/chattingItem.css';
import styles from './mycom/styles4List';

class Listview extends React.Component {
  componentDidMount () {
  this.props.dispatch(firebase_chat_list());
  }
  
  render() {
    const { classes, uid, chattings, selectedRoom } = this.props;

    return (
      <div className={classes.root}>
        <Typography variant="title" gutterBottom align="center">{selectedRoom.title}</Typography>
          <ul className="chat-list">
            {
              chattings.map((row, inx) => 
                uid===row.uid
                ? <ChatItem_Left key={inx} item={row} />
                : <ChatItem_Right key={inx} item={row} />
              )
            }          
          </ul>  
          <div style={{width: "100%"}}>
            <TextField multiline rows="2" margin="normal" variant="outlined" style={{float:"left", marginTop: "0px", width: "85%"}}/>    
            <Button variant="outlined"  style={{float:"left", marginLeft:"3px"}}>Send</Button>
          </div>
      </div>
    );
  }
}

Listview.propTypes = {
  classes: PropTypes.object.isRequired,
};

let mapStateToProps = (state) => {
  return {
    uid: state.uid,
    chattings: state.chattings,
    selectedRoom: state.selectedRoom,
  };
}

export default connect(mapStateToProps)(withStyles(styles)(Listview));
