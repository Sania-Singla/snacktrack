import { useRef } from 'react';
import {
    RemoveStudentPopup,
    EditStudentPopup,
    RemoveItemPopup,
    RemoveSnackPopup,
    EditItemPopup,
    EditSnackPopup,
    RemoveAllStudentsPopup,
    AddSnackPopup,
    AddItemPopup,
    EmailVerificationPopup,
    OrderPlacedPopup,
    EditCartItemPopup,
    OrderUnavailablePopup,
    IntermediateBillPopup,
    IntermediateBillDetailPopup,
    ProceedAsAdminPopup,
    ConfirmBulkStudentRegisterPopup,
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
            className="fixed inset-0 z-[1000] backdrop-blur-sm backdrop-brightness-50 flex items-center justify-center drop-shadow-md"
            ref={ref}
            onClick={popupInfo.blockScr ? null : close}
        >
            {children}
        </div>
    );

    if (!showPopup) return null;

    switch (popupInfo.type) {
        case 'ConfirmBulkStudentRegister':
            return (
                <Wrapper>
                    <ConfirmBulkStudentRegisterPopup />
                </Wrapper>
            );
        case 'proceedAsAdmin':
            return (
                <Wrapper>
                    <ProceedAsAdminPopup />
                </Wrapper>
            );
        case 'editCartItem':
            return (
                <Wrapper>
                    <EditCartItemPopup />
                </Wrapper>
            );
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
        case 'orderUnavailable':
            return (
                <Wrapper>
                    <OrderUnavailablePopup />
                </Wrapper>
            );
        case 'verifyEmail':
            return (
                <Wrapper>
                    <EmailVerificationPopup />
                </Wrapper>
            );
        case 'intermediateBill':
            return (
                <Wrapper>
                    <IntermediateBillPopup />
                </Wrapper>
            );
        case 'intermediateBillDetail':
            return (
                <Wrapper>
                    <IntermediateBillDetailPopup />
                </Wrapper>
            );
        default:
            return null;
    }
}
