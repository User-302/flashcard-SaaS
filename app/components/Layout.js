// components/Layout.jsx
import React from 'react';
import ChatBox from './Chatbox.js';

const Layout = ({ children, user }) => {
  return (
    <>
      {/* Your existing header, navigation, etc. */}
      {children}
      {user && <ChatBot user={user} />}
    </>
  );
};

export default Layout;
