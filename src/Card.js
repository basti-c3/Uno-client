import './Card.css';

function Card(props) {
    const cardObj = props.cardObj;
    if (props.backwards) {
        return (
            <div>
                <div className={`card card-back`}>
                    <span className="inner">
                        <span className="mark">{props.display ?? 'UNO'}</span>
                    </span>
                </div>
            </div>);
    } else {
        const cardColor = cardObj?.color === 'r' ? 'red'
            : cardObj?.color === 'g' ? 'green'
                : cardObj?.color === 'b' ? 'blue'
                    : cardObj?.color === 'y' ? 'yellow'
                        : cardObj?.color === 'black' ? 'black'
                            : 'purple'
        const cardSpeciality = cardObj?.speciality;
        if ("0123456789".includes(cardSpeciality)) {
            return (
                <div className={`card num-${cardSpeciality} ${cardColor}`}>
                    <span className="inner">
                        <span className="mark">{cardSpeciality}</span>
                    </span>
                </div>
            );
        } else if (cardObj?.speciality === 'skip' || cardObj?.speciality === 'reverse') {
            return (
                <div className={`card ${cardSpeciality} ${cardColor}`}>
                    <span className="inner">
                        <span className="mark mark-special">{cardObj?.speciality === 'skip' ? '⊘' : '⇄'}</span>
                    </span>
                </div>
            );
        } else if (cardObj?.speciality === '+2') {
            return (
                <div className={`card plus-2 ${cardColor}`}>
                    <span className="inner">
                        <span className="mark mark-special mark-plus2">+2</span>
                    </span>
                </div>
            );
        } else if (cardObj?.speciality === '+4') {
            console.log(`wish${cardObj.color}`);
            return (<img
                className={`card-img wish-${cardObj.color}`}
                src="https://4.bp.blogspot.com/-DCSoZ2YHkUI/UaxfRn5Vg6I/AAAAAAAATBA/nVbT-YWCdQw/s1600/5.png"
                alt="+4"/>);
        } else if (cardObj?.speciality === 'wish') {
            console.log(`wish${cardObj.color}`);
            return (<img
                className={`card-img wish-${cardObj.color}`}
                src="https://3.bp.blogspot.com/-TrKKRzX_uNU/UaxfRhGTpmI/AAAAAAAATA8/A7lej1-vCe4/s1600/310863+copy.png"
                alt="Wünsche-karte"/>);
        } else {
            return (
                <div className={`card num-${cardSpeciality ?? ''} ${cardColor ?? ''}`}>
                    <span className="inner">
                        <span className="mark">{cardSpeciality ?? 'wrong input'}</span>
                    </span>
                </div>);
        }
    }
}

export default Card;