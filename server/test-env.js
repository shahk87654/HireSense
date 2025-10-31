import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
console.log('API_KEY:', process.env.GEMINI_API_KEY || 'undefined');
console.log('PROJECT:', process.env.GEMINI_PROJECT || 'undefined');
