// import { Request, Response } from 'express';
// import { User } from '../models/user';
// import bcrypt from 'bcrypt';

// export const loginUser = async (req: Request, res: Response): Promise<void> => {
//     const { username, password }: { username: string; password: string } = req.body;
//     try {
//         const userDetails = await User.findOne({ username });

//         if (userDetails && bcrypt.compareSync(password, userDetails.password)) {
//             // const token = generateToken(userDetails);
//             res.json(userDetails);
//             //.cookie('token', token)
//         } else {
//             res.status(422).json("Invalid credentials");
//         }
//     } catch (e) {
//         console.error("Error in loginUser: ", e);
//         res.status(500).json({ error: (e as Error).message });
//     }
// };


import { Request, Response } from 'express';
import { User } from '../models/user';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'your-default-secret-key'; // Make sure SECRET_KEY is set in your environment variables

interface UserDetails {
    username: string;
}

// Generate public/private key pair (make sure to manage keys securely)
const { privateKey, publicKey } = generateKeyPair();

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password }: { username: string; password: string } = req.body;
    try {
        const userDetails = await User.findOne({ username });

        if (userDetails && bcrypt.compareSync(password, userDetails.password)) {
            const token = generateToken(userDetails); 
            const encryptedToken = encryptToken(token, privateKey); 
            
            res.cookie('token', encryptedToken, { httpOnly: true });
            res.json({ message: 'Login successful' });
        } else {
            res.status(422).json("Invalid credentials");
        }
    } catch (e) {
        console.error("Error in loginUser: ", e);
        res.status(500).json({ error: (e as Error).message });
    }
};

// Function to generate RSA key pair
function generateKeyPair() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });
    return { privateKey, publicKey };
}


function encryptToken(token: string, privateKey: string): string {
    const buffer = Buffer.from(token);
    const encrypted = crypto.privateEncrypt(privateKey, buffer);
    return encrypted.toString('base64');
}


function generateToken(userDetails: UserDetails): string {
    const payload = {
        username: userDetails.username,
    };

    const options = {
        expiresIn: '1h',
    };

    return jwt.sign(payload, SECRET_KEY, options);
}
