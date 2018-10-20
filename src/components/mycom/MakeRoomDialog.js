import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/Button';
import CloseIcon from  '@material-ui/icons/Close';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import WorkIcon from '@material-ui/icons/PermIdentity';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Checkbox from '@material-ui/core/Checkbox';

import styles from './styles4List';
import {firebase_make_chatroom} from '../../reducer/App_reducer';

class MakeRoomDialog extends React.Component {

  state = {
    checked: [],
  };

  handleToggle = value => () => {
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      checked: newChecked,
    });
  };

  handleMakeRoom = () => {
    if (this.state.checked.length < 2) {
      alert("Please select two or more participants");
      return;
    }
    this.props.dispatch(firebase_make_chatroom (this.state.checked));
    this.props.handleMakeRoomDialogClose();
  };


  render() {
    const { uid, makeRoomDialogOpen, classes, users, handleMakeRoomDialogClose } = this.props;

    return (
      <Dialog open={makeRoomDialogOpen} onClose={handleMakeRoomDialogClose} aria-labelledby="form-dialog-title" fullWidth>
        <DialogTitle disableTypography id="form-dialog-title" className={classes.dialogTitle}>
          <h2>Make Chatting Room</h2>
          <IconButton onClick={handleMakeRoomDialogClose} style={{float:"right"}}><CloseIcon /></IconButton>            
        </DialogTitle>
        <DialogContent>
          <List className={classes.list}>
                {
                    users.map((row, inx) => (
                      row.uid !== uid &&
                        <ListItem button key={inx} onClick={this.handleToggle(inx)}>
                          <Checkbox checked={this.state.checked.indexOf(inx) !== -1} tabIndex={-1} disableRipple />
                          <Avatar className={classes.Avata}>
                            { row.photourl 
                                ? <img src={row.photourl} alt="Profile" className={classes.Image}/>
                                : <WorkIcon/>
                            }
                          </Avatar>
                          <ListItemText primary={row.usernm} />
                            
                          <ListItemSecondaryAction className={classes.ListItemSecondaryAction}>
                            <ListItemText primary={row.usermsg}/>
                          </ListItemSecondaryAction>          
                        </ListItem>
                    ))
                }          
          </List>        
        </DialogContent>
        <DialogActions>
            <Button onClick={this.handleMakeRoom} variant="raised" color="primary" >Make Room</Button>
            <Button onClick={handleMakeRoomDialogClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>        
    );
  }
}

MakeRoomDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

let mapStateToProps = (state) => {
  return {
    uid: state.uid,
    users: state.users
  };
}

export default connect(mapStateToProps)(withStyles(styles)(MakeRoomDialog));
