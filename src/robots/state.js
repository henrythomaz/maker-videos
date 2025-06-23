import fs from 'fs';
const contentFilePath = './content.json';

function save(content) {
    const contentString = JSON.stringify(content, null, 2);
    fs.writeFileSync(contentFilePath, contentString);
    return content;
}

function load() {
    try {
        const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8');
        return JSON.parse(fileBuffer);
    } catch (error) {
        return null;
    }
}

export default { save, load };