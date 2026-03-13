const fs = require('fs');
const content = fs.readFileSync('frontend/lib/api.ts', 'utf8');

const target = "uploadAvatar: (id: string, file: File) => {";
const oldStr = content.substring(content.indexOf(target), content.indexOf("},", content.indexOf(target)) + 2);

const newStr = oldStr + "\n    follow: (id: string) => request<any>(\/api/users/\/follow\, { method: 'POST' }),\n    unfollow: (id: string) => request<any>(\/api/users/\/follow\, { method: 'DELETE' }),";

fs.writeFileSync('frontend/lib/api.ts', content.replace(oldStr, newStr));
console.log('patched');
