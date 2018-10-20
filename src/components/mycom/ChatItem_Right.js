import React from 'react';

import ChatItem_Image from './ChatItem_Image';
import ChatItem_File from './ChatItem_File';
import './chattingItem.css';

class ChatItem_Right extends React.Component {
  
  render() {
    const { item, beforeItem } = this.props;

    return (
            <li className="chat-row">
              { ! beforeItem || item.date !== beforeItem.date ?
              <div className="chat-date">
                <span  className="chat-date-span">{item.date}</span>
              </div>            : ''
              }
              {
                item.msgtype==="0"
                ? <div className="chat-bubble-right">{item.msg}</div>
                : item.msgtype==="1" ? <ChatItem_Image item={item} align="right"/> : <div className="chat-bubble-right"><ChatItem_File item={item}/></div>
              }
              <div className="chat-info-right">
                <div className="chat-time">{item.time}</div>
                <div className="chat-unread">{item.unreadcount>0 && item.unreadcount}</div>
              </div>
            </li>
    );
  }
}

export default ChatItem_Right;
