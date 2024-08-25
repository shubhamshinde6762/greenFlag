import { User } from "../models/user";
import { Request, Response } from 'express';
import fs from 'fs';
import bcrypt from 'bcrypt' 

const salt = bcrypt.genSaltSync(10);

interface UserData {
    username: string;
    password: string;
}

export const addUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const fileContent: string = fs.readFileSync('./sampleData/NewUsers.json', 'utf8');
        const newUsers: UserData[] = JSON.parse(fileContent);

        for (const user of newUsers) {
            const userExists = await User.findOne({ username: user.username });

            if (!userExists) {
                await User.create({
                    username: user.username,
                    password: bcrypt.hashSync(user.password, salt)
                });
            }
        }

        res.json("Success");
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
