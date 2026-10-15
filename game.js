(()=>{'use strict';const $=id=>document.getElementById(id),canvas=$('GameCanvas');let config,instance,started=false,ready=false,pauseBefore=false;
const message=t=>$('status').textContent=t;
window.H5UI={message};
function script(url){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(new Error('资源加载失败：'+url));document.head.append(s);});}
function localStore(sys){const storage=window.localStorage,prefix='h5-'+config.slug+':';sys.localStorage={getItem:k=>storage.getItem(prefix+k),setItem:(k,v)=>storage.setItem(prefix+k,String(v)),removeItem:k=>storage.removeItem(prefix+k),key:i=>Object.keys(storage).filter(k=>k.startsWith(prefix))[i]?.slice(prefix.length)||null,get length(){return Object.keys(storage).filter(k=>k.startsWith(prefix)).length;},clear:()=>Object.keys(storage).filter(k=>k.startsWith(prefix)).forEach(k=>storage.removeItem(k))};}
function setPaused(value){if(instance)instance.SendMessage('WebGameBridge','PauseWeb',value?'1':'0');if(window.cc&&cc.game)(value?cc.game.pause():cc.game.resume());if(window.cc3&&cc3.game)(value?cc3.game.pause():cc3.game.resume());}
function unlock(){canvas.focus();if(instance&&window.Module?.WebAudio?.audioContext)window.Module.WebAudio.audioContext.resume();if(window.cc?.sys?.__audioSupport?.context)cc.sys.__audioSupport.context.resume();}
function freeze(o){if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;}
window.H5Game=Object.freeze({snapshot:()=>freeze(JSON.parse(JSON.stringify(window.__gameSnapshot||{ready,engine:config?.engine}))) });
function gameReady(){if(ready)return;ready=true;$('loading').hidden=true;$('launch').hidden=false;setPaused(true);}
async function start(){if(started)return;started=true;$('welcome').hidden=true;$('loading').hidden=false;try{
 config=await(await fetch('./config.json')).json();
 if(config.engine==='unity'){
 await script('./Build/public.loader.js');instance=await createUnityInstance(canvas,{dataUrl:'./Build/public.data.unityweb',frameworkUrl:'./Build/public.framework.js.unityweb',codeUrl:'./Build/public.wasm.unityweb',streamingAssetsUrl:'StreamingAssets',companyName:config.owner,productName:config.title,productVersion:'h5-1',autoSyncPersistentDataPath:true,devicePixelRatio:Math.min(devicePixelRatio,2)},p=>{$('loading').querySelector('progress').value=p;message('正在加载 '+Math.floor(p*100)+'%');});gameReady();
 }else if(config.engine==='cocos2'){
 await script('./engine.js');localStore(cc.sys);await script('./src/settings.6dba7.js');await script('./src/offline.js');await script('./main.js');cc.view.enableAutoFullScreen(false);window.boot();
 }else{
 await script('./system.js');await script('./named-register.js');System.addImportMap({imports:{cc:'./src/cocos-js/cc.js'}});const {Application}=await System.import('./application.js');const app=new Application();const cc=await System.import('cc');localStore(cc.sys);app.init(cc);cc.game.onPostProjectInitDelegate.add(()=>{cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH,()=>setTimeout(gameReady,1000));});await app.start();
 }
 setTimeout(()=>{if(!ready){message('加载时间较长，请检查网络后重试。');$('retry').hidden=false;}},90000);
 }catch(e){message('加载失败：'+e.message);$('retry').hidden=false;console.error(e);}}
$('agree').onclick=start;$('retry').onclick=()=>location.reload();$('decline').onclick=()=>{$('welcome').hidden=true;$('exit').hidden=false;};$('return').onclick=()=>location.reload();
$('enter').onclick=()=>{$('launch').hidden=true;setPaused(false);unlock();};
$('privacy').onclick=()=>{pauseBefore=!$('paused').hidden;setPaused(true);$('legal').hidden=false;};$('close-legal').onclick=()=>{$('legal').hidden=true;if(!pauseBefore&&ready&&$('launch').hidden)setPaused(false);};
$('pause').onclick=()=>{if(ready){setPaused(true);$('paused').hidden=false;}};$('resume').onclick=()=>{$('paused').hidden=true;setPaused(false);unlock();};
$('home').onclick=()=>{if(instance)instance.SendMessage('WebGameBridge','SaveWeb','');if(window.__honorSaveProgress)__honorSaveProgress();location.reload();};
window.addEventListener('game-ready',gameReady);window.addEventListener('game-settings',()=>$('privacy').click());window.addEventListener('game-exit',()=>{setPaused(true);$('exit').hidden=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ready&&$('launch').hidden){setPaused(true);$('paused').hidden=false;}});
canvas.addEventListener('pointerdown',unlock);
})();
