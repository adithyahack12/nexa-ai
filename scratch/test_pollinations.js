import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.VITE_POLLINATIONS_API_KEY?.trim() || '';
console.log('Using API Key (trimmed):', apiKey);

const prompt = 'a beautiful galaxy';
const size = 512;
const seed = 1234;
const baseUrl = apiKey ? "https://gen.pollinations.ai/image" : "https://image.pollinations.ai/prompt";
const keyParam = apiKey ? `&key=${apiKey}` : "";
const url = `${baseUrl}/${encodeURIComponent(prompt)}?width=${size}&height=${size}&seed=${seed}&nologo=true&model=flux${keyParam}`;

console.log('Testing URL:', url);

async function test() {
    try {
        const response = await fetch(url);
        console.log('Status:', response.status);
        if (response.ok) {
            console.log('Successfully reached Pollinations!');
        } else {
            const text = await response.text();
            console.log('Failed with response:', text);
        }
    } catch (error) {
        console.error('Error during fetch:', error.message);
    }
}

test();
