import './PlayerInfoTable.css';
import {useEffect, useState} from "react";

function PlayerInfoTable(props) {
    const socket = props?.socket;
    const userList = props?.users;
    const [cardHandCounts, setCardHandCounts] = useState({});
    const [points, setPoints] = useState({});
    const [whoseTurn, setWhoseTurn] = useState('');

    useEffect(() => {
        const cardHandCountListener = (userName, cardHandCount) => {
            if (!userName) return;
            let copyCardHandCounts = {};
            Object.assign(copyCardHandCounts, cardHandCounts);
            if (cardHandCount === -1) { // user logged out
                delete copyCardHandCounts[userName];
            } else {
                copyCardHandCounts[userName] = cardHandCount;
            }
            setCardHandCounts(copyCardHandCounts);
        };

        const pointsChangedListener = (userName, newPoints) => {
            if (!userName) return;
            let copyTotalPoints = {};
            Object.assign(copyTotalPoints, points);
            if (newPoints === -1) { // user logged out
                delete copyTotalPoints[userName];
            } else {
                copyTotalPoints[userName] = newPoints;
            }
            setPoints(copyTotalPoints);
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
    }, [cardHandCounts, socket]);

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
                            <div key={user} className='player-info'>
                                {user === whoseTurn
                                    ? <div className='info-part user-name hisTurn'>{user}</div>
                                    : <div className='info-part user-name'>{user}</div>
                                }
                                <div>
                                    <div className={`info-part card-count`}>
                                        <span className="inner">
                                            <span className="mark">{cardHandCounts[user] ?? 0}</span>
                                        </span>
                                    </div>
                                </div>
                                <div className='info-part points'>{points[user] ?? 0}</div>
                            </div>
                        );
                    })
                    : <div>There are no players yet</div>
                : <div>No player info available</div>}
        </div>
    );
}

export default PlayerInfoTable;