import './PlayerInfoTable.css';
import {useEffect, useState} from "react";

function PlayerInfoTable(props) {
    const socket = props?.socket;
    const userList = props?.users;
    const [cardHands, setCardHands] = useState({});
    const [points, setPoints] = useState({});
    const [whoseTurn, setWhoseTurn] = useState('');

    useEffect(() => {
        const cardHandCountListener = (newCardHands) => {
            setCardHands(JSON.parse(newCardHands));
            console.log(JSON.parse(newCardHands));
        };

        const pointsChangedListener = (newPoints) => {
            setPoints(JSON.parse(newPoints));
        }

        const whoseTurnListener = (userInfo) => {
            let userName = userInfo[1];
            setWhoseTurn(userName);
        }

        socket.on('cardHandCountChanged', cardHandCountListener);
        socket.on('pointsChanged', pointsChangedListener);
        socket.on('whoseTurn', whoseTurnListener);
        return () => {
            socket.off('cardHandCountChanged', cardHandCountListener);
            socket.off('pointsChanged', pointsChangedListener);
            socket.off('whoseTurn', whoseTurnListener);
        }
    }, [cardHands, points, socket]);

    return (
        <div id='player-info-container'>
            <div className='player-info' id='info-labels'>
                <div>Name</div>
                <div>Cards</div>
                <div>Points</div>
            </div>
            {socket
                ? userList !== []
                    ? userList.map((user) => {
                        return (
                            <div key={user['socketId'] ?? user['name'] ?? 'key'} className='player-info'>
                                {user['name'] === whoseTurn
                                    ? <div className='info-part user-name hisTurn'>{user['name']}</div>
                                    : <div className='info-part user-name'>{user['name']}</div>
                                }
                                <div>
                                    <div className={`info-part card-count`}>
                                        <span className="inner">
                                            <span className="mark">{cardHands[user['socketId']]?.length ?? 0}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className='info-part points'>{points[user['socketId']] ?? 0}</div>
                            </div>
                        );
                    })
                    : <div>There are no players yet</div>
                : <div>No player info available</div>}
        </div>
    );
}

export default PlayerInfoTable;