import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import WorkIcon from '@material-ui/icons/PermIdentity';

import './chattingItem.css';

class ChatItem_Left extends React.Component {
  
  render() {
    const { item } = this.props;

    return (
            <li className="chat-row">
              <div className="chat-people">
                <Avatar > 
                  { item.userInfo.photourl 
                    ? <img src={item.userInfo.photourl} alt="Profile"/>
                    : <WorkIcon/>
                  }
                </Avatar>
              </div>
              <div className="chat-people-name">{item.userInfo.usernm}</div>
              <div className="chat-bubble-left">{item.msg}</div>
              <div className="chat-info-left">
                <div className="chat-time">{item.time}</div>
                <div className="chat-unread">{item.unreadcount>0 && item.unreadcount}</div>
              </div>
            </li>
    );
  }
}

export default ChatItem_Left;
