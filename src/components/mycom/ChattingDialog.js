import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import dateFormat from 'dateformat';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/Button';
import CloseIcon from  '@material-ui/icons/Close';
import AttachFileIcon from  '@material-ui/icons/AttachFile';
import ImageIcon from  '@material-ui/icons/Image';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import styles from './styles4List';
import {firebase_rooms_save, firebase_chat_save, show_dialog} from '../../reducer/App_reducer';

import ChatItem_Left from './ChatItem_Left';
import ChatItem_Right from './ChatItem_Right';
import {storage} from '../../reducer/Firestore';
import imageTool from './ImageTool';


class ChattingDialog extends React.Component {

  componentDidUpdate() {
    const listview = document.getElementById("listview");
    if (listview) {
      listview.scrollTop = listview.scrollHeight;
    }
  }

  handleDialogClose = () => {
    this.props.dispatch(show_dialog(false) );
  };    

  handleSendMsg = () => {
    if (this.inputMsg.value.trim().length===0) {
      alert("input your message.");
      return;
    }
    this.realSendMsg("0", this.inputMsg.value);     // 0 = text
    this.inputMsg.value = "";
    this.inputMsg.focus();
  };

  realSendMsg = (type, message, fileinfo) => {
    let data = {
      msg: message,
      msgtype: type,
      uid: this.props.uid,
      readUsers: [this.props.uid]
    }
    if (fileinfo) {
      data["filename"] = fileinfo.filename;
      if (fileinfo.filesize) data["filesize"] = fileinfo.filesize;
    }

    if (this.props.selectedRoom.roomid) {
      this.props.dispatch(firebase_chat_save(data));
    } else {
      this.props.dispatch(firebase_rooms_save(this.props.selectedRoom, data));
    }
  };

  handleAddImage = () => {
    const file = this.imagefile.files[0];

    var newname = this.getNewName();
    var filename = this.getFileName(file.name);

    const _this = this;
    storage.child('files/'+ newname).put(file);

    imageTool(file, (imageurl) =>  {
      const inx = imageurl.indexOf(';base64,');         // data:image/jpeg;base64,
      if (inx>0) imageurl = imageurl.substring( inx+8, imageurl.length);

      storage.child('filesmall/'+newname).putString(imageurl, 'base64').then(function(snapshot ) {
        _this.realSendMsg("1", newname, {"filename":filename});     // 1 = image
      });
    });
  }

  handleAttachFile = () => {
    const file = this.attachfile.files[0];

    var newname = this.getNewName();
    var filename = this.getFileName(file.name);

    const _this = this;
    storage.child('files/'+ newname).put(file).then(function(snapshot ) {
      _this.realSendMsg("2", newname, {"filename":filename, "filesize": _this.size2String(file.size) });     // 2 = file
    });
  }

  getNewName = () => {
    return  dateFormat(new Date(), "yyyymmddHHMMssl") + Math.floor((Math.random() * 10) + 1);
  }
  getFileName = (path) => {
    return path.substring(path.lastIndexOf('/')+1);
  }
  size2String = (filesize) => {
    const UNIT = 1024;
    if (filesize < UNIT){
        return filesize + " bytes";
    }
    let exp = Math.floor(Math.log(filesize) / Math.log(UNIT));

    return Math.floor(filesize / Math.pow(UNIT, exp)) + "KMGTPE".charAt(exp-1) + "bytes";
  }

  render() {
    const { dialogOpen, classes, uid, selectedRoom, chattings } = this.props;
    
    return (
      <Dialog open={dialogOpen} onClose={this.handleDialogClose} aria-labelledby="form-dialog-title" fullWidth>
        <DialogTitle disableTypography id="form-dialog-title" className={classes.dialogTitle}>
          <h2>{selectedRoom.title}</h2>
          <IconButton onClick={this.handleDialogClose} style={{float:"right"}}><CloseIcon /></IconButton>            
        </DialogTitle>
        <DialogContent id="listview">
          <ul className="chat-list">
            {
              chattings.map((row, inx) => 
                uid===row.uid
                ? <ChatItem_Right key={inx} item={row} beforeItem={chattings[inx-1]}/>
                : <ChatItem_Left key={inx} item={row}  beforeItem={chattings[inx-1]}/>
              )
            }          
          </ul>  
        </DialogContent>
        <DialogActions>
          <TextField inputRef={(node) => this.inputMsg = node} multiline rows="2" margin="normal" variant="outlined" style={{float:"left", marginTop: "0px", width: "85%"}}/> 
          <div>
            <Button onClick={this.handleSendMsg} variant="outlined" style={{height:"73px"}}>Send</Button>
          </div>
          <div>
            <input ref={(node) => this.imagefile = node} accept="image/*" className={classes.input} style={{ display: 'none' }}  id="imagefile"  type="file" onChange={this.handleAddImage}/>
            <label htmlFor="imagefile" style={{cursor:"pointer"}}><ImageIcon fontSize="small"/></label>

            <input ref={(node) => this.attachfile = node} accept="*" className={classes.input} style={{ display: 'none' }}  id="attachfile"  type="file" onChange={this.handleAttachFile}/>
            <label htmlFor="attachfile" style={{cursor:"pointer"}}><AttachFileIcon fontSize="small"/></label>
          </div>
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
