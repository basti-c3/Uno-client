import React, {useEffect, useState} from "react";
import './Messages.css';

function Messages({socket}) {
    const [messages, setMessages] = useState({});
    useEffect(() => {
        const messageListener = (message) => {
            message.value = _makeStringDisplayable(message);

            setMessages((prevMessages) => {
                const newMessages = {...prevMessages};
                newMessages[message.id] = message;
                return newMessages;
            });
        };

        const deleteMessageListener = (messageId) => {
            setMessages((prevMessages) => {
                const newMessages = {...prevMessages};
                delete newMessages[messageId];
                return newMessages;
            });
        };

        socket.on('message', messageListener);
        socket.on('deleteMessage', deleteMessageListener);
        socket.emit('getMessages');

        return () => {
            socket.off('message', messageListener);
            socket.off('deleteMessage', deleteMessageListener);
        };
    }, [socket]);


    return (
        <div className='message-list'>
            {[...Object.values(messages)]
                .sort((a, b) => a.time - b.time)
                .map((message) => (
                    <div
                        key={message.id}
                        className='message-container'
                        title={`Sent at ${new Date(message.time).toLocaleTimeString()}`}
                    >
                        <span className='user'>{message.user.name}:</span>
                        <span className='message'>{message.value}</span>
                        <span className='date'>{new Date(message.time).toLocaleTimeString()}</span>
                    </div>
                ))
            }
        </div>
    );
}

function _makeStringDisplayable(message) {
    const words = message.value.split(' ');
    let newMessageValue = "";
    words.forEach(word => {
        let newWord = "";
        let index = 0;
        while (index + 15 < word.length) {
            newWord = newWord + word.slice(index, index + 15) + "- ";
            index = index + 15;
        }
        newWord = newWord + word.slice(index);
        newMessageValue = newMessageValue + newWord + ' ';
    });
    return newMessageValue.slice(0, newMessageValue.length - 1);
}

export default Messages;