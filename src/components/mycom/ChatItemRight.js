import React from 'react';

import ChatItemImage from './ChatItemImage';
import ChatItemFile from './ChatItemFile';
import './chattingItem.css';

class ChatItemRight extends React.Component {
  
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
                : item.msgtype==="1" ? <ChatItemImage item={item} align="right"/> : <div className="chat-bubble-right"><ChatItemFile item={item}/></div>
              }
              <div className="chat-info-right">
                <div className="chat-time">{item.time}</div>
                <div className="chat-unread">{item.unreadcount>0 && item.unreadcount}</div>
              </div>
            </li>
    );
  }
}

export default ChatItemRight;
