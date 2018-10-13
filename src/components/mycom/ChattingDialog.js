import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/Button';
import CloseIcon from  '@material-ui/icons/Close';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import styles from './styles4List';
import {firebase_chat_save, show_dialog} from '../../reducer/App_reducer';

import ChatItem_Left from './ChatItem_Left';
import ChatItem_Right from './ChatItem_Right';

class ChattingDialog extends React.Component {

  handleDialogClose = () => {
    this.props.dispatch(show_dialog(false) );
  };    

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
    const { dialogOpen, classes, uid, selectedRoom, chattings } = this.props;

    return (
        <Dialog open={dialogOpen} onClose={this.handleDialogClose} aria-labelledby="form-dialog-title" fullWidth>
          <DialogTitle disableTypography id="form-dialog-title" className={classes.dialogTitle}>
            <h2>{selectedRoom.title}</h2>
            <IconButton onClick={this.handleDialogClose} style={{float:"right"}}><CloseIcon /></IconButton>            
          </DialogTitle>
          <DialogContent>
            <ul className="chat-list">
              {
                chattings.map((row, inx) => 
                  uid===row.uid
                  ? <ChatItem_Right key={inx} item={row} />
                  : <ChatItem_Left key={inx} item={row} />
                )
              }          
            </ul>  
          </DialogContent>
          <DialogActions>
            <TextField inputRef={(node) => this.inputMsg = node} multiline rows="2" margin="normal" variant="outlined" style={{float:"left", marginTop: "0px", width: "85%"}}/>    
            <Button variant="outlined"  style={{float:"left", marginLeft:"3px"}} onClick={this.handleSendMsg}>Send</Button>
          </DialogActions>
        </Dialog>        
    );
  }
}

ChattingDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

let mapStateToProps = (state) => {
  return {
    uid: state.uid,
    chattings: state.chattings,
    selectedRoom: state.selectedRoom,
    dialogOpen: state.dialogOpen,
  };
}

export default connect(mapStateToProps)(withStyles(styles)(ChattingDialog));
