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
import {firebase_chat_list, show_dialog} from '../reducer/App_reducer';

import MyFloatingButton from './mycom/MyFloatingButton';
import ChattingDialog from './mycom/ChattingDialog';
import MakeRoomDialog from './mycom/MakeRoomDialog';

class Listview extends React.Component {
  state = {
    makeRoomDialogOpen: false
  };

  handleRoomClick = (row) => {
    this.props.dispatch(firebase_chat_list(row));
    this.props.dispatch(show_dialog(true) );
  }

  handleMakeRoom = () => {
    this.setState({ makeRoomDialogOpen: true });
  }
  handleMakeRoomDialogClose = () => {
    this.setState({ makeRoomDialogOpen: false });
  };  

  render() {
    const { classes, rooms, uid, users } = this.props;
    const { makeRoomDialogOpen } = this.state;
    
    rooms.map((row, inx) => {
      if (row.peer) {
        let inx = users.findIndex(user => user.uid === row.peer);
        if (inx > -1){
            row.title = users[inx].usernm;
            row.photo = users[inx].photourl;
        }
      } else {
        const roomusers = Object.keys(row.users);
        var title = "";
        roomusers.some(function(item) {
          if (uid===item) return;
          const user = users.find(user => user.uid === item);
          if (user) title += user.usernm + ",";
          if (title.length > 30) return true;
        })
        row.title = title.substring(0, title.length-1);
      }
      return row;
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
                        <ListItemText primary={row.timestamp} secondary={row.count>0?row.count:''}/>
                      </ListItemSecondaryAction>          
                    </ListItem>
                ))
              }          
        </List>
        <ChattingDialog /> 
        <MakeRoomDialog makeRoomDialogOpen={makeRoomDialogOpen} handleMakeRoomDialogClose={this.handleMakeRoomDialogClose} />
        <MyFloatingButton handleClick={this.handleMakeRoom}/>
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
    users: state.users,
    rooms: state.rooms,
  };
}

export default connect(mapStateToProps)(withStyles(styles)(Listview));
