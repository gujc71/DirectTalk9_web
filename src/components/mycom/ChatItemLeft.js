import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import WorkIcon from '@material-ui/icons/PermIdentity';

import ChatItemImage from './ChatItemImage';
import ChatItemFile from './ChatItemFile';
import './chattingItem.css';

class ChatItemLeft extends React.Component {
  
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
                : item.msgtype==="1" ? <ChatItemImage item={item}  align="left"/> : <div className="chat-bubble-left"><ChatItemFile item={item}/></div>
              }
              <div className="chat-info-left">
                <div className="chat-time">{item.time}</div>
                <div className="chat-unread">{item.unreadcount>0 && item.unreadcount}</div>
              </div>
            </li>
    );
  }
}

export default ChatItemLeft;
