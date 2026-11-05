// Connection smoke check only. The API key is read from hidden stdin, never persisted.
import { stdin, stdout, exit } from 'node:process';
if (stdin.isTTY) stdin.setRawMode(true);
stdout.write('Ready for secret on hidden stdin.\n');
let input = '';
stdin.setEncoding('utf8');
stdin.on('data', async chunk => {
  input += chunk;
  if (!input.includes('\n') && !input.includes('\r')) return;
  stdin.pause();
  const key = input.trim(); input = '';
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:'deepseek-flash',messages:[{role:'user',content:'只回复OK'}],thinking:{type:'enabled'},reasoning_effort:'low',max_tokens:1024}),
      signal:AbortSignal.timeout(45000)
    });
    const data = await response.json();
    stdout.write(JSON.stringify({status:response.status,model:data.model,hasText:!!data.choices?.[0]?.message?.content,usage:data.usage,errorCode:data.error?.code,errorMessage:String(data.error?.message||'').slice(0,200)})+'\n');
    if (stdin.isTTY) stdin.setRawMode(false); exit(response.ok ? 0 : 1);
  } catch(error) {
    stdout.write(JSON.stringify({errorType:error.name,causeCode:error.cause?.code})+'\n'); if (stdin.isTTY) stdin.setRawMode(false); exit(1);
  }
});

