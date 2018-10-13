import React from 'react';

import './chattingItem.css';

class ChatItem_Right extends React.Component {
  
  render() {
    const { item } = this.props;
  
    return (
            <li className="chat-row">
              <div className="chat-bubble-right">{item.msg}</div>
              <div className="chat-info-right">
                <div className="chat-time">{item.time}</div>
                <div className="chat-unread">{item.unreadcount>0 && item.unreadcount}</div>
              </div>
            </li>
    );
  }
}

export default ChatItem_Right;
