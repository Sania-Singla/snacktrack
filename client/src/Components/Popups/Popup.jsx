import { useRef } from 'react';
import {
    UpdateAvatarPopup,
    RemoveStudentPopup,
    EditStudentPopup,
    NotificationsPopup,
    RemoveItemPopup,
    RemoveSnackPopup,
    EditItemPopup,
    EditSnackPopup,
    RemoveAllStudentsPopup,
    AddSnackPopup,
    AddItemPopup,
    EmailVerificationPopup,
    OrderPlacedPopup,
} from '..';
import { usePopupContext } from '../../Contexts';

export default function Popup() {
    const { popupInfo, setShowPopup, showPopup } = usePopupContext();
    const ref = useRef();

    function close(e) {
        if (e.target === ref.current) setShowPopup(false);
    }

    const Wrapper = ({ children }) => (
        <div
            className="fixed inset-0 z-[1000] backdrop-blur-sm flex items-center justify-center drop-shadow-md"
            ref={ref}
            onClick={close}
        >
            {children}
        </div>
    );

    if (!showPopup) return null;

    switch (popupInfo.type) {
        case 'removeAllStudents':
            return (
                <Wrapper>
                    <RemoveAllStudentsPopup />
                </Wrapper>
            );
        case 'removeStudent':
            return (
                <Wrapper>
                    <RemoveStudentPopup />
                </Wrapper>
            );
        case 'editStudent':
            return (
                <Wrapper>
                    <EditStudentPopup />
                </Wrapper>
            );
        case 'removeSnack':
            return (
                <Wrapper>
                    <RemoveSnackPopup />
                </Wrapper>
            );
        case 'editSnack':
            return (
                <Wrapper>
                    <EditSnackPopup />
                </Wrapper>
            );
        case 'removeItem':
            return (
                <Wrapper>
                    <RemoveItemPopup />
                </Wrapper>
            );
        case 'editItem':
            return (
                <Wrapper>
                    <EditItemPopup />
                </Wrapper>
            );
        case 'updateAvatar':
            return (
                <Wrapper>
                    <UpdateAvatarPopup />
                </Wrapper>
            );
        case 'addSnack':
            return (
                <Wrapper>
                    <AddSnackPopup />
                </Wrapper>
            );
        case 'addItem':
            return (
                <Wrapper>
                    <AddItemPopup />
                </Wrapper>
            );
        case 'orderPlaced':
            return (
                <Wrapper>
                    <OrderPlacedPopup />
                </Wrapper>
            );
        case 'verifyEmail':
            return (
                <Wrapper>
                    <EmailVerificationPopup />
                </Wrapper>
            );
        case 'notifications':
            return (
                <Wrapper>
                    <NotificationsPopup />
                </Wrapper>
            );
        default:
            return null;
    }
}
