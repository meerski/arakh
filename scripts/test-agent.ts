// Quick agent test — registers, connects via WebSocket, runs through actions
import WebSocket from 'ws';

const API = 'http://127.0.0.1:3000';

async function main() {
  // 1. Register owner + player
  console.log('=== Registering owner ===');
  const res = await fetch(`${API}/owner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName: 'TestAgent' }),
  });
  const reg = await res.json() as { ownerId: string; playerId: string; displayName: string };
  console.log(`Owner: ${reg.ownerId}`);
  console.log(`Player: ${reg.playerId}`);

  // 2. Connect WebSocket
  console.log('\n=== Connecting WebSocket ===');
  const ws = new WebSocket('ws://127.0.0.1:3000');

  const messages: any[] = [];

  ws.on('message', (data: Buffer) => {
    const msg = JSON.parse(data.toString());
    messages.push(msg);

    if (msg.type === 'narrative') {
      console.log(`[NARRATIVE] ${msg.payload.text}`);
    } else if (msg.type === 'action_result') {
      console.log(`[ACTION] success=${msg.payload.success}`);
      console.log(`  "${msg.payload.narrative}"`);
      if (msg.payload.sensoryData) {
        const sd = msg.payload.sensoryData;
        console.log(`  Location: ${sd.surroundings}`);
        console.log(`  Nearby: ${sd.nearbyEntities?.length ?? 0} entities`);
        console.log(`  Threats: ${sd.threats?.join(', ') || 'none'}`);
        console.log(`  Opportunities: ${sd.opportunities?.join(', ') || 'none'}`);
      }
    } else if (msg.type === 'error') {
      console.log(`[ERROR] ${msg.payload.code}: ${msg.payload.message}`);
    } else if (msg.type === 'event') {
      console.log(`[EVENT] ${msg.payload.description}`);
    } else {
      console.log(`[${msg.type}]`, JSON.stringify(msg.payload).slice(0, 200));
    }
  });

  await new Promise<void>((resolve) => ws.on('open', resolve));

  // 3. Authenticate with playerId
  ws.send(JSON.stringify({
    type: 'action',
    payload: { playerId: reg.playerId, type: 'observe', params: {} },
  }));

  await sleep(1500);

  // 4. Run a series of actions
  const actions = [
    { type: 'observe', params: {} },
    { type: 'explore', params: {} },
    { type: 'forage', params: {} },
    { type: 'rest', params: {} },
    { type: 'learn', params: {} },
    { type: 'experiment', params: { subject: 'local plants' } },
    { type: 'communicate', params: { message: 'hello' } },
    { type: 'breed', params: {} },
    { type: 'propose', params: { offer: 'share hunting grounds', demand: 'non-aggression pact' } },
    { type: 'craft', params: { what: 'sharp rock' } },
    { type: 'build', params: { what: 'nest' } },
    { type: 'move', params: { direction: 'north' } },
  ];

  for (const action of actions) {
    console.log(`\n--- Sending: ${action.type} ---`);
    ws.send(JSON.stringify({ type: 'action', payload: action }));
    await sleep(800);
  }

  // 5. Check world state
  console.log('\n=== World State ===');
  const worldRes = await fetch(`${API}/world`);
  const world = await worldRes.json();
  console.log(JSON.stringify(world, null, 2));

  // 6. Check dashboard
  console.log('\n=== Dashboard ===');
  const dashRes = await fetch(`${API}/dashboard/${reg.ownerId}`);
  const dash = await dashRes.json();
  console.log(JSON.stringify(dash, null, 2));

  console.log('\n=== Test complete ===');
  ws.close();
  process.exit(0);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
