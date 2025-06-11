const fs = require('fs');

try {
  const content = fs.readFileSync('app/page.tsx', 'utf8');
  
  // Count brackets and parentheses
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;
  let templateLiteralCount = 0;
  let inTemplateLiteral = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i-1] : '';
    
    if (char === '`' && prevChar !== '\\') {
      inTemplateLiteral = !inTemplateLiteral;
      templateLiteralCount += inTemplateLiteral ? 1 : -1;
    }
    
    if (!inTemplateLiteral) {
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '(') parenCount++;
      else if (char === ')') parenCount--;
      else if (char === '[') bracketCount++;
      else if (char === ']') bracketCount--;
    }
  }
  
  console.log('Bracket Analysis:');
  console.log('Braces { }: ', braceCount);
  console.log('Parentheses ( ): ', parenCount);
  console.log('Square brackets [ ]: ', bracketCount);
  console.log('Template literals ` `: ', templateLiteralCount);
  
  if (braceCount !== 0 || parenCount !== 0 || bracketCount !== 0 || templateLiteralCount !== 0) {
    console.log('❌ Found unmatched brackets/parentheses');
  } else {
    console.log('✅ All brackets and parentheses are matched');
  }
  
} catch (error) {
  console.error('Error reading file:', error.message);
}
