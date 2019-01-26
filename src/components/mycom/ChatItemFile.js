import React from 'react';
import {storage} from '../../reducer/Firestore';

class ChatItemFile extends React.Component {

  handleFileDownload = () => {
    const { item } = this.props;
    storage.child("files/"+item.msg).getDownloadURL()
      .then(function(url) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function(event) {
          var blob = xhr.response;
          var a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          let windowURL = window.URL.createObjectURL(blob);
          a.href = windowURL;
          a.download = item.filename;
          a.click();
          window.URL.revokeObjectURL(windowURL);
        };
        xhr.open('GET', url);
        xhr.send();
      }).catch(function(error) {
        console.log(error);
      }); 
  }

  render() {
    const { item } = this.props;
    return (
      <a style={{cursor:"pointer", textDecoration: "none", color:"black" }} onClick={this.handleFileDownload} > 
        {item.filename} <br/> {item.filesize}
        <hr/>
        Download
      </a>
    )
  }
} 

export default ChatItemFile;
