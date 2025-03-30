import {
    Canteen,
    Contractor,
    Student,
    Snack,
    PackagedFood,
} from './Models/index.js';
import {
    USER_PLACEHOLDER_IMAGE_URL,
    SNACK_PLACEHOLDER_IMAGE_URL,
} from './Constants/index.js';

export const seedDatabase = async () => {
    try {
        // Clear existing data
        await Canteen.deleteMany();
        await Contractor.deleteMany();
        await Student.deleteMany();
        await Snack.deleteMany();
        await PackagedFood.deleteMany(); // Clear packaged food items

        console.log('Existing data cleared');

        // Seed Canteens
        const canteen1 = await Canteen.create({
            hostelType: 'GH',
            hostelNumber: 8,
            hostelName: 'Florence Nightingale',
        });

        const canteen2 = await Canteen.create({
            hostelType: 'BH',
            hostelNumber: 2,
            hostelName: 'Mother Teresa',
        });

        // Seed Contractors
        const password = 'password'; // Will be hashed using pre-save hook

        const contr1 = await Contractor.create({
            canteenId: canteen1._id,
            fullName: 'John Doe',
            email: 'john@example.com',
            password: password,
            phoneNumber: '1234567890',
            avatar: USER_PLACEHOLDER_IMAGE_URL,
        });

        const contr2 = await Contractor.create({
            canteenId: canteen2._id,
            fullName: 'sam',
            email: 'sam@example.com',
            password: password,
            phoneNumber: '7777333333',
            avatar: USER_PLACEHOLDER_IMAGE_URL,
        });

        canteen1.contractorId = contr1._id;
        canteen2.contractorId = contr2._id;
        await canteen1.save();
        await canteen2.save();

        // Seed Students
        await Student.create([
            {
                canteenId: canteen1._id,
                userName: 'GH8-101',
                fullName: 'Alice Smith',
                phoneNumber: '9876543210',
                password: password,
                email: 'student1@email.com',
                avatar: USER_PLACEHOLDER_IMAGE_URL,
            },
            {
                canteenId: canteen1._id,
                userName: 'GH8-75',
                fullName: 'Bob Johnson',
                phoneNumber: '9876543211',
                password: password,
                email: 'student2@email.com',
                avatar: USER_PLACEHOLDER_IMAGE_URL,
            },
            {
                canteenId: canteen2._id,
                userName: 'BH2-248',
                fullName: 'Charlie Brown',
                phoneNumber: '9876543212',
                password: password,
                email: 'student3@email.com',
                avatar: USER_PLACEHOLDER_IMAGE_URL,
            },
            {
                canteenId: canteen2._id,
                userName: 'BH2-3',
                fullName: 'Daisy Miller',
                phoneNumber: '9876543213',
                password: password,
                email: 'student4@email.com',
                avatar: USER_PLACEHOLDER_IMAGE_URL,
            },
        ]);

        // Seed Snacks
        const snacks = await Snack.create([
            {
                canteenId: canteen1._id,
                name: 'Samosa',
                price: 15,
                image: SNACK_PLACEHOLDER_IMAGE_URL,
                isAvailable: true,
            },
            {
                canteenId: canteen1._id,
                name: 'Sandwich',
                price: 30,
                image: SNACK_PLACEHOLDER_IMAGE_URL,
                isAvailable: true,
            },
            {
                canteenId: canteen1._id,
                name: 'Puff',
                price: 20,
                image: SNACK_PLACEHOLDER_IMAGE_URL,
                isAvailable: false,
            },
            {
                canteenId: canteen2._id,
                name: 'Burger',
                price: 40,
                image: SNACK_PLACEHOLDER_IMAGE_URL,
                isAvailable: true,
            },
            {
                canteenId: canteen2._id,
                name: 'Paneer Roll',
                price: 50,
                image: SNACK_PLACEHOLDER_IMAGE_URL,
                isAvailable: true,
            },
            {
                canteenId: canteen2._id,
                name: 'Vada Pav',
                price: 20,
                image: SNACK_PLACEHOLDER_IMAGE_URL,
                isAvailable: false,
            },
        ]);

        // Associate Snacks with Canteens
        canteen1.snacks = [snacks[0]._id, snacks[1]._id, snacks[2]._id];
        canteen2.snacks = [snacks[3]._id, snacks[4]._id, snacks[5]._id];
        await canteen1.save();
        await canteen2.save();

        // 🌟 Seed Packaged Food Items
        await PackagedFood.create([
            {
                category: 'Biscuits',
                canteenId: canteen1._id,
                variants: [
                    { price: 10, availableCount: 50 },
                    { price: 20, availableCount: 30 },
                    { price: 50, availableCount: 20 },
                ],
            },
            {
                category: 'Chips',
                canteenId: canteen2._id,
                variants: [
                    { price: 10, availableCount: 40 },
                    { price: 30, availableCount: 25 },
                ],
            },
            {
                category: 'Chocolates',
                canteenId: canteen1._id,
                variants: [
                    { price: 20, availableCount: 35 },
                    { price: 50, availableCount: 15 },
                ],
            },
            {
                category: 'Drinks',
                canteenId: canteen1._id,
                variants: [
                    { price: 30, availableCount: 60 },
                    { price: 50, availableCount: 40 },
                ],
            },
            {
                category: 'instant food',
                canteenId: canteen1._id,
                variants: [
                    { price: 20, availableCount: 45 },
                    { price: 40, availableCount: 30 },
                ],
            },
            {
                category: 'maggie',
                canteenId: canteen1._id,
                variants: [
                    { price: 20, availableCount: 45 },
                    { price: 40, availableCount: 30 },
                ],
            },
            {
                category: 'chocos',
                canteenId: canteen1._id,
                variants: [
                    { price: 20, availableCount: 45 },
                    { price: 40, availableCount: 30 },
                ],
            },
            {
                category: 'pasta',
                canteenId: canteen1._id,
                variants: [
                    { price: 20, availableCount: 45 },
                    { price: 40, availableCount: 30 },
                ],
            },
            {
                category: 'oats',
                canteenId: canteen1._id,
                variants: [
                    { price: 20, availableCount: 45 },
                    { price: 40, availableCount: 30 },
                ],
            },
            {
                category: 'candies',
                canteenId: canteen1._id,
                variants: [
                    { price: 20, availableCount: 45 },
                    { price: 40, availableCount: 30 },
                ],
            },
        ]);

        console.log('Seeding completed successfully');
    } catch (error) {
        console.error('Seeding error:', error);
    }
};
