import controls from '../../constants/controls';

const playerOneCriticalHitKeys = Object.assign(
    {},
    ...controls.PlayerOneCriticalHitCombination.map(key => ({ [key]: false }))
);
const playerTwoCriticalHitKeys = Object.assign(
    {},
    ...controls.PlayerTwoCriticalHitCombination.map(key => ({ [key]: false }))
);

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

const activeKeys = {
    [controls.PlayerOneBlock]: false,
    [controls.PlayerTwoBlock]: false,
    ...playerOneCriticalHitKeys,
    ...playerTwoCriticalHitKeys,
    PlayerOneCriticalHitCombination() {
        return this.KeyQ && this.KeyW && this.KeyE;
    },
    PlayerTwoCriticalHitCombination() {
        return this.KeyU && this.KeyI && this.KeyO;
    }
};

let playerOneCriticalHit = true;
let playerTwoCriticalHit = true;

export function getHitPower(fighter) {
    const { attack } = fighter;
    const criticalHitChance = getRandomNumber(1, 2);
    const power = attack * criticalHitChance;
    return power;
    // return hit power
}

export function getBlockPower(fighter) {
    const { defense } = fighter;
    const dodgeChance = getRandomNumber(1, 2);
    const power = defense * dodgeChance;
    return power;
    // return block power
}

export function getDamage(attacker, defender) {
    const hitPower = getHitPower(attacker);
    const blockPower = getBlockPower(defender);
    const damage = Math.max(hitPower - blockPower, 0);
    return damage;
    // return damage
}

export async function fight(firstFighter, secondFighter) {
    const leftFighterIndicator = document.getElementById('left-fighter-indicator');
    const rightFighterIndicator = document.getElementById('right-fighter-indicator');
    let leftFighterHealth = firstFighter.health;
    let rightFighterHealth = secondFighter.health;

    return new Promise(resolve => {
        const handleKeyUp = e => {
            if (Object.prototype.hasOwnProperty.call(activeKeys, e.code)) {
                delete activeKeys[e.code];
            }
        };

        const handleKeyDown = e => {
            if (Object.prototype.hasOwnProperty.call(activeKeys, e.code)) {
                activeKeys[e.code] = true;
            }
            if (e.code === controls.PlayerOneAttack && !activeKeys[controls.PlayerOneBlock]) {
                rightFighterHealth -= getDamage(
                    firstFighter,
                    activeKeys[controls.PlayerTwoBlock] ? secondFighter : { defense: 0 }
                );
                rightFighterIndicator.style.width = `${(rightFighterHealth / secondFighter.health) * 100}%`;
            }
            if (e.code === controls.PlayerTwoAttack && !activeKeys[controls.PlayerTwoBlock]) {
                leftFighterHealth -= getDamage(
                    secondFighter,
                    activeKeys[controls.PlayerOneBlock] ? firstFighter : { defense: 0 }
                );
                leftFighterIndicator.style.width = `${(leftFighterHealth / secondFighter.health) * 100}%`;
            }
            if (activeKeys.PlayerOneCriticalHitCombination() && playerOneCriticalHit) {
                playerOneCriticalHit = false;
                setTimeout(() => {
                    playerOneCriticalHit = true;
                }, 10000);
                rightFighterHealth -= getDamage(firstFighter, { defense: 0 }) * 2;
                rightFighterIndicator.style.width = `${(rightFighterHealth / secondFighter.health) * 100}%`;
            }
            if (activeKeys.PlayerTwoCriticalHitCombination() && playerTwoCriticalHit) {
                playerTwoCriticalHit = false;
                setTimeout(() => {
                    playerTwoCriticalHit = true;
                }, 10000);
                leftFighterHealth -= getDamage(secondFighter, { defense: 0 }) * 2;
                leftFighterIndicator.style.width = `${(leftFighterHealth / firstFighter.health) * 100}%`;
            }
            if (leftFighterHealth <= 0) {
                window.removeEventListener('keyup', handleKeyUp);
                window.removeEventListener('keydown', handleKeyDown);
                resolve(secondFighter);
                return;
            }
            if (rightFighterHealth <= 0) {
                window.removeEventListener('keyup', handleKeyUp);
                window.removeEventListener('keydown', handleKeyDown);
                resolve(firstFighter);
            }
        };

        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('keydown', handleKeyDown);
    });
}
