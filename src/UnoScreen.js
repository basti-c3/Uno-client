import React, {useEffect, useState} from "react";
import Card from "./Card";
import './UnoScreen.css';
import CardObject from './CardObject';

function UnoScreen(props) {
    const socket = props?.socket;

    const sortCards = document.getElementById('sortCardsCheckBox')?.value;
    let [userCardHand, setCardHand] = useState([]);
    let [cardInTheMiddle, setCardInTheMiddle] = useState(new CardObject(''));
    let [myTurn, setMyTurn] = useState(false);
    let [whoseTurn, setWhoseTurn] = useState(undefined);
    let [selectColor, setSelectColor] = useState(false);
    let [playedBlackCard, setPlayedBlackCard] = useState(new CardObject(''));
    let [drawCardNumber, setDrawCardNumber] = useState(1);
    let [unoClicked, setUnoClicked] = useState(false);
    let [wouldntPlay, setWouldntPlay] = useState(false);
    let [gameFinished, setGameFinished] = useState(false);

    useEffect(() => {
        const cardLayedDownListener = (cardObj) => {
            console.log("cardLayedDownnnn", cardObj);
            setCardInTheMiddle(cardObj);
        }

        const cardHandListener = (cardHand) => {
            console.log("gotCardHand", cardHand);
            setCardHand((_) => cardHand);
        }

        const whoseTurnListener = (userInfo) => {
            let [socketId, userName] = userInfo;
            setMyTurn(socketId === socket.id);
            setWhoseTurn(userName);
        }

        const haveToDrawCardsListener = function (drawNumber) {
            console.log("have to draw ", drawNumber, " cards");
            setDrawCardNumber(drawNumber);
        }

        const errorHandler = (errorMsg) => {
            console.log("naaah, something went wrong somewhere.");
            throw Error(errorMsg);
        }

        const newGameListener = () => {
            setCardHand([]);
            setCardInTheMiddle(new CardObject(''));
            setMyTurn(false);
            setWhoseTurn(undefined);
            setSelectColor(false);
            setPlayedBlackCard(new CardObject(""));
            setDrawCardNumber(1);
            setUnoClicked(false);
            setWouldntPlay(false);
            setGameFinished(false);
        }

        const gameFinishedListener = () => {
            setGameFinished(true);
        }

        const debugHandler = (...args) => console.log("DEBUG: ", args);

        socket.on('newGame', newGameListener);
        socket.on('gameFinished', gameFinishedListener);
        socket.on('gotCardHand', cardHandListener);
        socket.on('cardLayedDown', cardLayedDownListener);
        socket.on('whoseTurn', whoseTurnListener);
        socket.on('haveToDrawCards', haveToDrawCardsListener);
        socket.on('error', errorHandler);
        socket.on('debug', debugHandler);

        return () => {
            socket.off('gotCardHand', cardHandListener); // Todo: Ergibt das Sinn?
            socket.off('gameFinished', gameFinishedListener);
            socket.off('cardLayedDown', cardLayedDownListener);
            socket.off('whoseTurn', whoseTurnListener);
        };
    }, [socket]);

    const startGame = () => {
        socket.emit('startGame');
    }

    const onCardClicked = function (cardObj) {
        // Can't finish with green
        if (userCardHand.length === 1 && cardObj.color === 'g') return;
        // Have to draw cards
        if (drawCardNumber !== 1 && !cardObj.speciality.includes('+')) return;

        let sameCard = cardInTheMiddle.cardProperties === cardObj.cardProperties;
        if (sameCard) {
            if (cardObj.blackCard) {
                setSelectColor(true);
                setPlayedBlackCard(cardObj);
            } else {
                setDrawCardNumber(1);
                socket.emit('layDownCard', cardObj);
            }
        } else if (myTurn) {
            let cardFits =
                cardObj.blackCard ||
                cardObj.speciality === cardInTheMiddle.speciality ||
                (cardObj.color === cardInTheMiddle.color && (drawCardNumber === 1 || cardObj.speciality !== '+2')); // No +2 on +4!
            if (cardFits) {
                // Uno
                if (userCardHand.length === 2 && !unoClicked) socket.emit('drawCards', 2);
                else if (unoClicked) setUnoClicked(false);

                if (cardObj.blackCard) {
                    setSelectColor(true);
                    setPlayedBlackCard(cardObj);
                } else {
                    socket.emit('layDownCard', cardObj);
                    // Wouldnt play
                    if (wouldntPlay) setWouldntPlay(false);
                    setDrawCardNumber(1);
                }
            }
        }
    }

    const drawCards = function () {
        if (!myTurn) return;
        // Cant go on drawing cards
        if (!wouldntPlay) {
            if (drawCardNumber === 1) {
                setWouldntPlay(true);
            }
            socket.emit('drawCards', drawCardNumber);
            setDrawCardNumber(1);
        } else {
            socket.emit('passedTurn');
            setWouldntPlay(false);
            setSelectColor(false);
        }
    }

    const wishColor = function (wishedColor) {
        setSelectColor(false);
        setDrawCardNumber(1);
        socket.emit('layDownCard', new CardObject(playedBlackCard.id, wishedColor));
    }

    const callUno = function () {
        if (!myTurn) return;
        if (drawCardNumber !== 1) return;
        if (userCardHand.length !== 2) {
            socket.emit('drawCards', 2);

        } else {
            setUnoClicked(true);
        }
    }

    return (whoseTurn && !gameFinished
            ?
            <div id='uno-screen-wrapper'>
                <button
                    onClick={startGame}
                    id='start-game-button'
                    className='uno-button'>Start Game
                </button>
                <div id='whoseTurn'>
                    {myTurn
                        ? <h1>It is my turn!</h1>
                        : whoseTurn ?
                            <h1>It`s {whoseTurn}`s turn!</h1>
                            : <div/>
                    }
                </div>
                <div id='card-section'>
                    <div id='card-table'>
                        <div id='card-pile'>
                            {cardInTheMiddle?.id
                                ?
                                <div key={cardInTheMiddle.id} className='card-container card-in-the-middle'>
                                    <Card cardObj={cardInTheMiddle} id={cardInTheMiddle.id}/>
                                </div>
                                :
                                <div>Card pile is empty</div>
                            }
                        </div>
                        <div id='draw-pile'>
                            {<div className='card-container' onClick={drawCards}>
                                <Card backwards={true}
                                      display={drawCardNumber !== 1
                                          ? '+ ' + drawCardNumber.toString() + ' cards'
                                          : wouldntPlay === true
                                              ? 'Pass' : undefined}
                                      id='draw-button'
                                      onClick={drawCards}/>
                            </div>
                            }
                        </div>
                    </div>
                    <div id='private-section'>
                        <div id='card-hand'>
                            {userCardHand
                                .sort((cardA, cardB) => sortCards
                                    ? cardA.color.localeCompare(cardB.color)
                                    : cardA.timeStamp - cardB.timeStamp
                                )
                                .map((cardObj) => (
                                    <div key={cardObj.id} className='card-container'
                                         onClick={() => onCardClicked(cardObj)}>
                                        <Card cardObj={cardObj} id={cardObj.id}/>
                                    </div>
                                ))
                            }
                        </div>
                        <div id='button-section'>
                            {selectColor
                                ?
                                <div id='color-buttons-container'>
                                    <button id='wish-red' className='uno-button'
                                            onClick={() => wishColor('r')}>Red
                                    </button>
                                    <button id='wish-red' className='uno-button'
                                            onClick={() => wishColor('g')}>Green
                                    </button>
                                    <button id='wish-red' className='uno-button'
                                            onClick={() => wishColor('b')}>Blue
                                    </button>
                                    <button id='wish-red' className='uno-button'
                                            onClick={() => wishColor('y')}>Yellow
                                    </button>
                                    <div/>
                                </div>
                                :
                                <div id='normal-buttons-container'>
                                    <div className='uno-button'>
                                        <button onClick={callUno}>Uno</button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>

            : <button
                onClick={startGame}
                id='start-game-button'
                className='uno-button'>Start
            </button>
    );
}

export default UnoScreen;
