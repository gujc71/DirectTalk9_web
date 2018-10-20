import React from 'react';
import {storage} from '../../reducer/Firestore';

class MyImage extends React.Component {
      
  componentDidMount() {
    const img = this.img;

    storage.child("filesmall/"+this.props.item.msg).getDownloadURL()
      .then(function(url) {
        img.src = url;
        
      }).catch(function(error) {
        console.log(error);
      });
  }
  render() {
    //const { src, className } = this.props;

    return (
      <img alt="..." ref={(node) => this.img = node} style={{width:"200px", float: this.props.align}}/>
    )
  }
}

export default MyImage;
