import React, {useEffect, useState} from "react";
import io from 'socket.io-client';
import Messages from './Messages';
import MessageInput from './MessageInput';
import PlayerInfoTable from './PlayerInfoTable';
import UnoScreen from './UnoScreen';
import "./UnoCards";
import './App.css';

function App() {

    // Socket handling
    let [socket, setSocket] = useState(null);
    let [userList, setUserList] = useState([]);
    useEffect(() => {
        const newSocket = io(`https://unoapi.janraab.de`); // https://unoapi.janraab.de  &&  http://${window.location.hostname}
        setSocket(newSocket);

        return () => newSocket.close();
    }, [setSocket]);

    // User handling
    let [loggedUser, setLoggedUser] = useState('');
    let [userNameInput, setUserNameInput] = useState('');

    const setNewUser = function () {
        socket.emit('logIn', userNameInput, socket.id);
        setUserNameInput('');
    }

    const otherUserJoined = function (otherUserName) {
        console.log(`User ${otherUserName} logged in.`);
    }

    useEffect(() => {
        const userNameListener = (userName, socketId) => {
            if (socket.id === socketId) {
                console.log('You have successfully logged in');
                setLoggedUser(userName);
            } else {
                otherUserJoined(userName);
            }
        }

        const userListListener = (gottenUserList) => {
            setUserList(JSON.parse(gottenUserList));
        }

        const debugHandler = (...args) => console.log("DEBUG-App: ", args);

        socket?.on('userLoggedIn', userNameListener);
        socket?.on('userListChanged', userListListener);
        socket?.on('debug', debugHandler);
        return () => {
            socket?.off('userLoggedIn', userNameListener);
            socket?.off('userListChanged', userListListener);
            socket?.off('debug', debugHandler);
        }
    }, [loggedUser, socket, userList]);

    return (
        <div className='App'>
            <header className='app-header'>
                {loggedUser !== ''
                    ? (<div>Signed in as {loggedUser}</div>)
                    : (<div>
                        <div>Not signed in</div>
                        <form id='player-name-input' onSubmit={(e) => {
                            e.preventDefault();
                            setNewUser();
                        }}>
                            <input
                                autoFocus
                                value={userNameInput}
                                placeholder='Type in a username'
                                onChange={(e) => {
                                    setUserNameInput(e.currentTarget.value);
                                }}
                            />
                        </form>
                        <button onClick={setNewUser}>Sign in</button>
                    </div>)
                }
            </header>
            <div className='main-screen'>
                {socket && loggedUser ? (
                    <div className='uno-screen'>
                        <UnoScreen socket={socket}/>
                    </div>
                ) : (
                    <div className='uno-screen'>Please log in ... </div>
                )}
                {socket && loggedUser
                    ? (<div className='side-screen'>

                            <div className='side-screen-block' id='player-info'>
                                {socket ? (
                                    <div id='player-info-table'>
                                        <PlayerInfoTable socket={socket} users={userList}/>
                                    </div>
                                ) : (
                                    <div>Not Connected </div>
                                )}
                            </div>
                            <div className='side-screen-block' id='chat-container'>
                                {socket ? (
                                    <div>
                                        <Messages socket={socket}/>
                                        <MessageInput className='text-field' socket={socket}/>
                                    </div>
                                ) : (
                                    <div>Not Connected </div>
                                )}
                            </div>

                        </div>
                    ) : (<div>Nothing to see here</div>)
                }
            </div>
        </div>
    );
}

export default App;