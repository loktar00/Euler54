import fs from 'fs';
const data = fs.readFileSync('p054_poker.txt', 'utf8');
const games = data.replace(/\r/g, '').split('\n');

console.time('track');
const cardValues = {
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14
};

const scores = {
  High: 1,
  Pair: 2,
  TwoPair: 3,
  Three: 4,
  Straight: 5,
  Flush: 6,
  FullHouse: 7,
  Four: 8,
  StraightFlush: 9,
  Royal: 10
}

function getCardValue(card) {
    return cardValues[card[0]] || ~~card[0];
}

function sortHand(a, b) {
  return getCardValue(a) - getCardValue(b);
}

function getHands(game) {
  const cards = game.split(' ');
  const player1 = cards.slice(0, 5).sort(sortHand);
  const player2 = cards.slice(5).sort(sortHand);
  const player1Score = scoreHand(player1);
  const player2Score = scoreHand(player2);

  if (player1Score[0] === player2Score[0]) {
    for (let c = player1Score.length; c--; c > 0) {
        if (player1Score[c] !== player2Score[c]) {
            if (player1Score[c] > player2Score[c]) {
                return 'P1';
            }
            return 'P2';
        }
    }
  }

  if (player1Score[0] > player2Score[0]) {
    return 'P1';
  }

  return 'P2';
}

// Finds any number matches within the hand.
function getMatches(hand) {
  const matches = {};
  let match = 1;

  for (let c = 1; c <= hand.length - 1; c++) {
    if (hand[c][0] === hand[c - 1][0]) {
      match++;
    } else {
      match = 1;
    }

    if (match > 1) {
      matches[hand[c - 1][0]] = match;
    }
  }
  return matches;
}

function scoreHand(hand) {
  let score = [0];
  const highestValue = getCardValue(hand[4]);
  score = [scores['High'], highestValue];

  // Check for matches
  const uniqueCards = [...new Set(hand.map(card => card[0]))];

  if (uniqueCards.length !== 5) {
    // We have at least one match
    const matches = getMatches(hand);
    const matchKeys = Object.keys(matches);

    // Get all of the cards not part of the pairs/matches
    const highestNonMatch = uniqueCards
        .filter(card => !matchKeys.includes(card))
        .map(card => getCardValue(card));

    // Two sets of matches found
    if (matchKeys.length === 2) {
      // only 2 unique cards in the deck, so it's a fullhouse.
      if (uniqueCards.length === 2) {
        score = [scores['FullHouse']];
      } else {
        // 3 unique cards so has to be two pair.
        score = [scores['TwoPair']];
      }

      score = [...score, highestNonMatch, getCardValue(matchKeys[0]), getCardValue(matchKeys[1])].flat()
    }

    // one set of matches found
    if (matchKeys.length === 1) {
      if (uniqueCards.length === 3) {
        score = [scores['Three']];
      } else if (uniqueCards.length === 2) {
        score = [scores['Four']];
      } else {
        score = [scores['Pair']];
      }
      score = [...score, highestNonMatch, getCardValue(matchKeys[0])].flat();
    }
  } else {
    // no matches check the rest of the conditions
    const sameSuit = [...new Set(hand.map(card => card[1]))].length === 1;
    const straight = getCardValue(hand[4]) === getCardValue(hand[0]) + 4;
    const royalFlush = sameSuit && straight && hand[0][0] === 'T';

    if (royalFlush) {
      score = [scores['Royal']];
    } else if (sameSuit && straight) {
      score = [scores['StraightFlush']];
    } else if (sameSuit) {
      score = [scores['Flush']];
    } else if (straight) {
      score = [scores['Straight']];
    }

    score = [...score, highestValue];
  }
  return score;
}

function scoreGames(games) {
  const winners = {
    P1: 0,
    P2: 0
  };

  games.forEach(game => {
    const winner = getHands(game);
    winners[winner]++;
  });

  return winners;
}

console.timeEnd('track');

console.log(scoreGames(games));