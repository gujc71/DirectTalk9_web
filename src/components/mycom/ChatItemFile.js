import React from 'react';
import {storage} from '../../reducer/Firestore';

class ChatItemFile extends React.Component {

  componentDidMount() {
    const link = this.link;
    
    storage.child("files/"+this.props.item.msg).getDownloadURL()
      .then(function(url) {
        link.href = url;
      }).catch(function(error) {
        console.log(error);
      }); 
  }

  render() {
    const { item } = this.props;
    return (
      <a style={{cursor:"pointer", textDecoration: "none", color:"black" }} ref={(node) => this.link = node} download={item.filename} > 
        {item.filename} <br/> {item.filesize}
        <hr/>
        Download
      </a>
    )
  }
} 

export default ChatItemFile;
