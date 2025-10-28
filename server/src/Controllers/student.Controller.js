import {
    OK,
    COOKIE_OPTIONS,
    NOT_FOUND,
    BAD_REQUEST,
    FORBIDDEN,
} from '../Constants/index.js';
import {
    tryCatch,
    verifyExpression,
    ErrorHandler,
    verifyQR,
    genQR,
} from '../Utils/index.js';
import { generateTokens } from '../Helpers/index.js';
import { Student, Contractor } from '../Models/index.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

export const login = tryCatch('login student', async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        throw new ErrorHandler('missing fields', BAD_REQUEST);
    }

    const student = await Student.findOne({ userName })
        .select('-refreshToken')
        .populate('canteenId')
        .lean();

    if (!student) throw new ErrorHandler('student not found', NOT_FOUND);

    const hostelName = student.canteenId.hostelName;
    const hostelNumber = student.canteenId.hostelNumber;
    const hostelType = student.canteenId.hostelType;
    const isOpen = student.canteenId.isOpen;
    student.canteenId = student.canteenId._id;

    const isPassValid = await bcrypt.compare(password, student.password);
    if (!isPassValid) {
        throw new ErrorHandler('invalid credentials', BAD_REQUEST);
    }

    // generate tokens
    const { accessToken, refreshToken } = await generateTokens({
        _id: student._id,
        role: 'student',
    });

    await Student.findByIdAndUpdate(student._id, { $set: { refreshToken } });

    const { password: _, ...user } = student;

    return res
        .status(OK)
        .cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
        })
        .cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: Number(process.env.REFRESH_TOKEN_MAXAGE),
        })
        .json({
            ...user,
            role: 'student',
            isOpen,
            hostelType,
            hostelNumber,
            hostelName,
        });
});

export const loginFromQR = tryCatch(
    'login student from qr',
    async (req, res) => {
        const { decode } = req.body;

        const { _id, token } = decode;

        if (!_id || !token) {
            throw new ErrorHandler('invalid qr code', FORBIDDEN);
        }

        const student = await Student.findById(_id)
            .populate('canteenId', 'hostelName hostelNumber hostelType')
            .select('-refreshToken')
            .lean();

        if (!student) throw new ErrorHandler('invalid qr code', FORBIDDEN);

        verifyQR({ token, passHash: student.password });

        const hostelName = student.canteenId.hostelName;
        const hostelNumber = student.canteenId.hostelNumber;
        const hostelType = student.canteenId.hostelType;
        const isOpen = student.canteenId.isOpen;
        student.canteenId = student.canteenId._id;

        // generate tokens
        const { accessToken, refreshToken } = await generateTokens({
            _id,
            role: 'student',
        });

        await Student.findByIdAndUpdate(_id, { $set: { refreshToken } });

        return res
            .status(OK)
            .cookie('accessToken', accessToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
            })
            .cookie('refreshToken', refreshToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.REFRESH_TOKEN_MAXAGE),
            })
            .json({
                ...student,
                role: 'student',
                isOpen,
                hostelType,
                hostelNumber,
                hostelName,
            });
    }
);

// export const updatePassword = tryCatch('update password', async (req, res) => {
//     const { oldPassword, newPassword } = req.body;
//     const { password, _id, role } = req.user;

//     const isPassValid = bcrypt.compareSync(oldPassword, password);
//     if (!isPassValid) {
//         throw new ErrorHandler('invalid credentials', BAD_REQUEST);
//     }

//     const isValid = verifyExpression('password', newPassword);
//     if (!isValid) throw new ErrorHandler('invalid password', BAD_REQUEST);

//     // hash new password
//     const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

//     const Model = role === 'contractor' ? Contractor : Student;
//     await Model.findByIdAndUpdate(_id, {
//         $set: { password: hashedNewPassword },
//     });

//     return res.status(OK).json({ message: 'password updated successfully' });
// });

export const updatePassword = tryCatch('update password', async (req, res) => {
    const { token, newPassword } = req.body;
    const { password, _id, role } = req.user;
    const isQRValid = await verifyQR({
        token: token,
        passHash: password,
    });
    if (!isQRValid) {
        throw new ErrorHandler('invalid QR', BAD_REQUEST);
    }


    const isValid = verifyExpression('password', newPassword);
    if (!isValid) throw new ErrorHandler('invalid password', BAD_REQUEST);

    // hash new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

    let qrDataURL = null;

    if (role === 'student') {
        qrDataURL = await genQR({
            _id,
            passHash: hashedNewPassword,
        });
    }

    const Model = role === 'contractor' ? Contractor : Student;
    await Model.findByIdAndUpdate(_id, {
        $set: { password: hashedNewPassword },
    });

    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');

    const fileName = 'myUpdatedQR.png';

    const tempDir = path.join(process.cwd(), 'public', 'temp');

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const qrFilePath = path.join(tempDir, fileName);
    fs.writeFileSync(qrFilePath, base64Data, 'base64');

    res.download(qrFilePath, fileName, (err) => {
        if (err) {
            console.error('Error sending file:', err);
        }
        fs.unlink(qrFilePath, (unlinkErr) => {
            if (unlinkErr)
                console.error('Failed to delete temp QR file:', unlinkErr);
        });
    });
});
