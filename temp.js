const fs = require('fs');
let content = fs.readFileSync('frontend/lib/api.ts', 'utf8');
content = content.replace(
  'myMatches: () => request<any>(`/api/matches/my-matches`),',
  `myMatches: () => request<any>('/api/matches/my-matches'),\n      explore: (params?: { q?: string; category?: string }) => {\n        const sp = new URLSearchParams();\n        if (params?.q) sp.set('q', params.q);\n        if (params?.category) sp.set('category', params.category);\n        return request<any>(`/api/matches/explore?${sp}`);\n      },`
);
fs.writeFileSync('frontend/lib/api.ts', content);
console.log('Done');