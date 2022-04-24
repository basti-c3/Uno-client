class CardObject {
    // id in format "r 5 v1" or "y reverse v2"
    // black card before wish: "black wish v3", after wish: "black wish v3" but color ="green"
    constructor(id, color = undefined) {
        this.id = id;
        this.timeStamp = Date.now();
        const splittedId = id.split(' ');

        this.blackCard = splittedId[0] === 'black';

        this.speciality = splittedId[1];
        this.cardProperties = this.speciality + ' ' + splittedId[0]; // black even if color is set for black card
        this.color = color === undefined
            ? splittedId[0]
            : color;
    }

    id;
    color;
    speciality;
    blackCard;
    timeStamp;
    cardProperties;
}

export default CardObject;