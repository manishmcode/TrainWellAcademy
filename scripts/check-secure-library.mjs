import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchLibrary, secureLibraryAssetUrl, libraryRefreshDelay } from '../src/services/library.js';
import { hasActivePlan } from '../src/services/account.js';
import { request, clearApiCache } from '../src/services/api.js';

const values = new Map();
const signed = `/v/e30.${Buffer.from(JSON.stringify({exp: Math.floor(Date.now()/1000)+900})).toString('base64url')}.signature`;
globalThis.window = {location:{protocol:'https:'},dispatchEvent:()=>{}};
globalThis.document = {cookie:''};
globalThis.localStorage = {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
globalThis.sessionStorage = {removeItem:()=>{}};

test('signed media refresh fetches fresh URLs and never falls back to public files', async () => {
  values.set('trainwellacademy_token',signed.slice(3));
  const original=globalThis.fetch;
  let calls=0;
  globalThis.fetch=async()=>{calls++;return {ok:true,status:200,json:async()=>({success:true,data:[{title:'Fitness',cards:[{image:signed,link:signed},{image:'https://example.com/assets/1/thumb.webp',link:'/assets/1/clip.mp4'}]}]})};};
  try {
    const rows=await fetchLibrary();
    await fetchLibrary();
    assert.equal(calls,2);
    assert.equal(rows[0].cards[0].image,signed);
    assert.equal(rows[0].cards[0].link,signed);
    assert.equal(rows[0].cards[1].image,'');
    assert.equal(rows[0].cards[1].link,'');
    assert.match(document.cookie,/trainwellacademy_token=/);
    assert.match(document.cookie,/; Secure/);
    const delay=libraryRefreshDelay(rows);
    assert.ok(delay>850000 && delay<=870000);
    assert.equal(libraryRefreshDelay([]),null);
    for(const invalid of ['javascript:alert(1)','//example.com/v/a.b.c','/v/a.b.c?extra=1',null]) assert.equal(secureLibraryAssetUrl(invalid),'');
  } finally {globalThis.fetch=original;}
});

test('membership uses the current plan instead of old paid subscriptions',()=>{
  assert.equal(hasActivePlan({plan_id:2,subscriptions:[]}),true);
  assert.equal(hasActivePlan({plan_id:'3'}),true);
  for(const plan_id of [null,0,-1,'invalid']) assert.equal(hasActivePlan({plan_id,subscriptions:[{status:'active',payment_status:'paid'}]}),false);
});

test('403 preserves the session and 401 clears it',async()=>{
  const original=globalThis.fetch;
  try {
    for(const status of [403,401]){
      clearApiCache();values.set('trainwellacademy_token',signed.slice(3));
      globalThis.fetch=async()=>({ok:false,status,json:async()=>({success:false,message:'Access denied'})});
      await assert.rejects(request('/library',{cache:false}),/Access denied/);
      assert.equal(values.has('trainwellacademy_token'),status===403);
    }
  } finally {globalThis.fetch=original;}
});
