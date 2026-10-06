import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),dest=path.join(root,'poll/google');await fs.mkdir(dest,{recursive:true});
const read=p=>fs.readFile(path.join(root,p),'utf8');
const core=await read('poll/core.cjs'),data=await read('public/02-04-poll/data.js');
// Wrap pure rules in an object so their helper functions are never RPC-callable.
const wrapped='var PollCore = (function(){\n'+core.replace(/if \(typeof module[^\n]*\n?/g,'')+'\nreturn {newSession,validText,snapshot,submitVote,learnerSnapshot,submitLearnerVote,manage,validCode,withAllResults,publicSnapshot,submitPublicVote};\n}());\n';
const backend=await read('poll/Code.gs');
await fs.writeFile(path.join(dest,'Code.gs'),backend+'\n'+wrapped+'\n'+data.replace(/if \(typeof module[^\n]*\n?/g,''));
const html='<!doctype html><html lang="ja"><head><base target="_top"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+await read('public/02-04-poll/style.css')+'</style></head><body><main id="poll-app"></main><script>window.POLL_EMBED = <?!= embed ?>;</script><script>'+data+'</script><script>'+await read('public/02-04-poll/app.js')+'</script></body></html>';
await fs.writeFile(path.join(dest,'Index.html'),html);
await fs.writeFile(path.join(dest,'appsscript.json'),JSON.stringify({timeZone:'Asia/Tokyo',exceptionLogging:'STACKDRIVER',runtimeVersion:'V8',oauthScopes:['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/script.container.ui']},null,2));
console.log('Googleコピー用：poll/google/Code.gs・Index.html・appsscript.json');
