const fs = require('fs');
const file = '/Users/subha/Desktop/flash-flood-prediction/react-frontend/src/services/api.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'throw new Error(data.detail || "Registration failed");',
  `let errMsg = "Registration failed";
    if (typeof data.detail === "string") {
      errMsg = data.detail;
    } else if (Array.isArray(data.detail)) {
      errMsg = data.detail.map(e => e.msg).join(", ");
    }
    throw new Error(errMsg);`
);

fs.writeFileSync(file, content);
