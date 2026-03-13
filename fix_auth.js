const fs = require('fs');
let content = fs.readFileSync('frontend/context/AuthContext.tsx', 'utf8');
content = content.replace("reviewsCount?: number;", "reviewsCount?: number;\n  following?: string[];\n  followers?: string[];");
fs.writeFileSync('frontend/context/AuthContext.tsx', content);
