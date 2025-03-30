import { LOGO } from '../Constants/constants';

function sendNotification(text, title = 'Order Update') {
    Notification.requestPermission().then((prem) => {
        alert(prem);
        if (prem === 'granted') {
            const notification = new Notification(title, {
                body: text,
                icon: LOGO,
            });
            notification.onclick = () => {
                window.focus();
            };
        }
    });
}

export { sendNotification };
