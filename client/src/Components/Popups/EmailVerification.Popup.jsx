import { useState, useRef, useEffect } from 'react';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import { usePopupContext } from '../../Contexts';
import { adminService } from '../../Services';
import toast from 'react-hot-toast';

export default function EmailVerificationPopup() {
    const { popupInfo, setShowPopup } = usePopupContext();
    const [loading, setLoading] = useState(false);
    const [resendingMail, setResendingMail] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [expiryTime, setExpiryTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        setExpiryTime(Date.now() + 60000);
        return () => clearInterval(timerRef.current);
    }, []);

    const handleChange = (index, value) => {
        const newCode = [...code];
        newCode[index] = value.replace(/\D/g, '');
        setCode(newCode);
        if (value && index < 5) inputRefs.current[index + 1].focus();
        setDisabled(newCode.some((digit) => !digit));
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !code[i] && i > 0) {
            inputRefs.current[i - 1].focus();
        }
    };

    const verifyEmail = async () => {
        setLoading(true);
        try {
            const res = await adminService.verifyCode({
                email: popupInfo.target.email,
                code: code.join(''),
            });
            if (res && res.message === 'Email verified Successfully') {
                popupInfo.onVerify();
                toast.success('Email verified Successfully');
            } else {
                toast.error('Invalid code. Please try again.');
            }
        } catch (err) {
            toast.error('Failed to verify email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resendCode = async () => {
        try {
            setResendingMail(true);
            const res = await adminService.sendVerificationCode({
                email: popupInfo.target.email,
                fullName: popupInfo.target.fullName,
            });
            if (res && res.message === 'Verification code sent') {
                toast.success(res.message);
                // Set new expiry time (current time + 60 seconds)
                const newExpiryTime = Date.now() + 60000;
                setExpiryTime(newExpiryTime);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0].focus();
            }
        } catch (err) {
            toast.error('Failed to resend code. Please try again.');
        } finally {
            setResendingMail(false);
        }
    };

    useEffect(() => {
        if (!expiryTime) return;

        function updateTimer() {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((expiryTime - now) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0) clearInterval(timerRef.current);
        }

        updateTimer();

        // Set up interval
        timerRef.current = setInterval(updateTimer, 200); // Update more frequently for smoother countdown

        return () => clearInterval(timerRef.current);
    }, [expiryTime]);

    return (
        <div className="relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl overflow-hidden text-black p-5 flex flex-col items-center justify-center gap-4">
            <Button
                btnText={
                    <div className="size-[20px] stroke-black">
                        {icons.cross}
                    </div>
                }
                title="Close"
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2"
            />

            <div className="flex flex-col gap-3">
                <p className="text-xl font-semibold text-center">
                    Verify Email
                </p>
                <p className="text-[15px] text-center">
                    Enter the 6-digit code sent to your email
                </p>

                <div className="flex items-center justify-center gap-2">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                                handleChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            ref={(el) => (inputRefs.current[index] = el)}
                            className="size-10 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-[#4977ec] focus:outline-none"
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                <div className="text-center">
                    {timeLeft > 0 ? (
                        <p className="text-sm text-gray-600">
                            Resend code in {timeLeft} seconds
                        </p>
                    ) : (
                        <Button
                            btnText={
                                resendingMail ? 'Sending...' : 'Resend Code'
                            }
                            onClick={resendCode}
                            disabled={resendingMail}
                            className="text-sm text-[#4977ec] hover:underline disabled:opacity-50"
                        />
                    )}
                </div>

                <Button
                    btnText={
                        loading ? (
                            <div className="flex items-center justify-center w-full">
                                <div className="size-5 fill-[#4977ec] animate-spin">
                                    {icons.loading}
                                </div>
                            </div>
                        ) : (
                            'Verify'
                        )
                    }
                    onClick={verifyEmail}
                    disabled={disabled || loading || resendingMail}
                    className="text-white rounded-md py-2 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2] disabled:opacity-50"
                />
            </div>
        </div>
    );
}
