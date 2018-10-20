import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import WorkIcon from '@material-ui/icons/PermIdentity';

import ChatItem_Image from './ChatItem_Image';
import ChatItem_File from './ChatItem_File';
import './chattingItem.css';

class ChatItem_Left extends React.Component {
  
  render() {
    const { item, beforeItem } = this.props;

    return (
            <li className="chat-row">
              { ! beforeItem || item.date !== beforeItem.date ?
              <div className="chat-date">
                <span  className="chat-date-span">{item.date}</span>
              </div>            : ''
              }
              <div className="chat-people">
                <Avatar > 
                  { item.userInfo.photourl 
                    ? <img src={item.userInfo.photourl} alt="Profile" style={{width: "40px", height: "40px"}}/>
                    : <WorkIcon/>
                  }
                </Avatar>
              </div>
              <div className="chat-people-name">{item.userInfo.usernm}</div>
              {
                item.msgtype==="0"
                ? <div className="chat-bubble-left">{item.msg}</div>
                : item.msgtype==="1" ? <ChatItem_Image item={item}  align="left"/> : <div className="chat-bubble-left"><ChatItem_File item={item}/></div>
              }
              <div className="chat-info-left">
                <div className="chat-time">{item.time}</div>
                <div className="chat-unread">{item.unreadcount>0 && item.unreadcount}</div>
              </div>
            </li>
    );
  }
}

export default ChatItem_Left;
