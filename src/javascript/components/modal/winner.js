import showModal from './modal';
import { createFighterImage } from '../fighterPreview';

export default function showWinnerModal(fighter) {
    // call showModal function
    const onModalClose = () => {
        const rootElement = document.getElementById('root');
        rootElement.innerHTML = '';
    };
    const winnerImg = createFighterImage(fighter);
    showModal({ title: `${fighter.name} won!`, bodyElement: winnerImg, onClose: onModalClose });
}
