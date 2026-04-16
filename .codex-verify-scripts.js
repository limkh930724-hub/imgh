const fs = require('fs');
const vm = require('vm');
const files = ['index.html','fear-greed.html','compound.html','goal.html','journal.html','backtest.html','workout.html'];
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  if (!scripts.length) {
    console.log(file + ' OK no-inline-script');
    continue;
  }
  try {
    scripts.forEach((src, i) => new vm.Script(src, { filename: file + '#script' + i }));
    console.log(file + ' OK script-syntax');
  } catch (err) {
    console.log(file + ' FAIL ' + err.message);
  }
}
