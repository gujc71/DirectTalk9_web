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

import styles from './mycom/styles4List';
import { connect } from 'react-redux';
import {firebase_chat_list, firebase_chat_save, show_dialog} from '../reducer/App_reducer';

import ChattingDialog from './mycom/ChattingDialog';

class Listview extends React.Component {

  handleRoomClick = (row) => {
    this.props.dispatch(firebase_chat_list(row));
    this.props.dispatch(show_dialog(true) );
  }

  handleSendMsg = () => {
    let data = {
      msg: this.inputMsg.value,
      msgtype: "0",
      uid: this.props.uid,
      readUsers: [this.props.uid]      
    }
    this.props.dispatch(firebase_chat_save(data));
    this.inputMsg.value = "";
  };

  render() {
    const { classes, rooms, users } = this.props;

    rooms.map((row, inx) => {
      //console.log(row);
      if (row.peer) {
        let inx = users.findIndex(user => user.uid === row.peer);
        if (inx > -1){
            row.title = users[inx].usernm;
            row.photo = users[inx].photourl;
        }
      }
    })
    return (
      <div className={classes.root}>
        <Typography variant="title" gutterBottom align="center">
          Room List
        </Typography>
        <List className={classes.list}>
              {
                rooms.map((row, inx) => (
                    <ListItem button key={inx} onClick={this.handleRoomClick.bind(this, row)}>
                      <Avatar>
                        { row.photo 
                          ? <img src={row.photo} alt="Profile" className={classes.Image}/>
                          : <WorkIcon/>
                        }
                      </Avatar>
                      <ListItemText primary={row.title} secondary={row.msg}/>
                        
                      <ListItemSecondaryAction className={classes.ListItemSecondaryAction}>
                        <ListItemText primary={row.timestamp} secondary={row.count}/>
                      </ListItemSecondaryAction>          
                    </ListItem>
                ))
              }          
        </List>
        <ChattingDialog />        
      </div>
    );
  }
}

Listview.propTypes = {
  classes: PropTypes.object.isRequired,
};

let mapStateToProps = (state) => {
  return {
    users: state.users,
    rooms: state.rooms,
  };
}

export default connect(mapStateToProps)(withStyles(styles)(Listview));
