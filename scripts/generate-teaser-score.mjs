// Original comedy-pop cue: 144 BPM, C major, mallets, pizzicato bass and playful FX.
// Synthesized from oscillators and seeded noise; no recordings or third-party samples.
import fs from 'node:fs';
const rate=44100,seconds=50,n=rate*seconds,beat=60/144;
const left=new Float32Array(n),right=new Float32Array(n);
let seed=9214;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
const hz=m=>440*2**((m-69)/12);
function put(k,v,pan=0){if(k>=0&&k<n){left[k]+=v*Math.sqrt((1-pan)/2);right[k]+=v*Math.sqrt((1+pan)/2);}}
function note(start,midi,duration=.3,amp=.13,kind='mallet',pan=0){
 const f=hz(midi),length=Math.floor(duration*rate),offset=Math.round(start*rate);
 for(let j=0;j<length;j++){
  const t=j/rate,tail=Math.min(1,(duration-t)/.035),attack=Math.min(1,t/.004);
  let v;
  if(kind==='bass')v=(Math.sin(2*Math.PI*f*t)+.32*Math.sin(4*Math.PI*f*t))*Math.exp(-t*7);
  else if(kind==='chord')v=(Math.sin(2*Math.PI*f*t)+.35*Math.sin(4*Math.PI*f*t)+.15*Math.sin(6*Math.PI*f*t))*Math.exp(-t*12);
  else if(kind==='bell')v=(Math.sin(2*Math.PI*f*t)+.2*Math.sin(2*Math.PI*f*3*t)*Math.exp(-t*10))*Math.exp(-t*4);
  else v=(Math.sin(2*Math.PI*f*t)+.45*Math.sin(2*Math.PI*f*4*t)*Math.exp(-t*28))*Math.exp(-t*8);
  put(offset+j,v*attack*tail*amp,pan);
 }
}
function drum(start,kind,amp=.16){
 const length=kind==='kick'?.22:kind==='snare'?.13:.045;
 for(let j=0;j<length*rate;j++){const t=j/rate;
 const v=kind==='kick'?Math.sin(2*Math.PI*(58*t+2*(1-Math.exp(-t*45))))*Math.exp(-t*22):kind==='snare'?(random()*.65+Math.sin(2*Math.PI*185*t)*.35)*Math.exp(-t*34):random()*Math.exp(-t*95);
 put(Math.round(start*rate)+j,v*amp,kind==='hat'?.35:0);
 }
}
function pop(start,from=650,to=1200,amp=.16){let phase=0;const duration=.16;for(let j=0;j<duration*rate;j++){const t=j/rate;phase+=2*Math.PI*(to+(from-to)*Math.exp(-t*25))/rate;put(Math.round(start*rate)+j,Math.sin(phase)*Math.sin(Math.PI*t/duration)*Math.exp(-t*15)*amp);}}
function sparkle(start){[84,88,91,96].forEach((m,i)=>note(start+i*.055,m,.5,.105,'bell',(i-1.5)*.3));}
const chords=[[60,64,67],[65,69,72],[62,65,69],[67,71,74]];
const melodies=[
 [72,76,79,76,81,79,76,74,72,74,76,79],
 [77,81,84,81,79,77,76,77,81,79,77,76],
 [74,77,81,77,84,81,79,77,74,76,77,81],
 [79,83,86,83,84,83,81,79,77,76,74,71],
 [72,76,79,84,83,81,79,76,74,76,79,84]
];
function section(start,end,variation=0,level=1){
 for(let b=0;start+b*beat<end-.05;b++){
  const t=start+b*beat,chord=chords[(Math.floor(b/4)+variation)%4];
  note(t,chord[b%2?2:0]-24,.26,.23*level,'bass');
  drum(t,b%2?'snare':'kick',.17*level);
  for(let h=0;h<2;h++)if(t+h*beat/2<end-.04)drum(t+h*beat/2,'hat',.042*level);
  chord.forEach((m,i)=>note(t+beat*.5,m,.14,.058*level,'chord',(i-1)*.5));
  const m=melodies[variation%5][b%12];
  note(t,m,.3,.19*level,'mallet',-.2);
  if(b%4===2&&t+beat*.65<end-.08)note(t+beat*.65,m+2,.15,.115*level,'mallet',.25);
 }
}
// A jaunty opening, with three bars (five seconds) per character.
section(0,3,0,.75);sparkle(.1);
for(let c=0;c<5;c++){const start=3+c*5;section(start,start+5,c);pop(start,c%2?1100:550,c%2?500:1300);}
// Comic drum roll, a rising run, then the announcement's silence.
for(let j=0;j<16;j++)drum(28+j*.12,'snare',.045+j*.006);
[72,74,76,77,79,81,83,84].forEach((m,i)=>note(28+i*.22,m,.2,.14,'mallet',i/10-.35));
// Bright "ta-da!" major fanfare; leave air for applause, then resume the groove.
[60,64,67,72,76,79,84].forEach((m,i)=>note(31+i*.015,m,1.2,.15,'bell',(i-3)*.17));
drum(31,'kick',.3);sparkle(31.15);
[79,79,84].forEach((m,i)=>note(31.65+i*.22,m,.65,.18,'mallet'));
section(33,36,0,.55);
section(36,41,1,.65);
section(41,45,4,.9);
[41,42+1/3,43+2/3].forEach((t,i)=>pop(t,500+i*100,1200-i*150,.14));
// Title flourish and a cheerful three-note sign-off.
sparkle(45);section(45,48,0,.75);
[79,76,84].forEach((m,i)=>note(48+i*.24,m,1.4,.17,'bell',i*.2-.2));
[48,60,64,67].forEach(m=>note(48.48,m,1.4,.11,'bell'));
// Short room reflections rather than the earlier atmospheric sustained sound.
for(let i=n-1;i>=Math.round(rate*.09);i--){left[i]+=right[i-Math.round(rate*.09)]*.10;right[i]+=left[i-Math.round(rate*.07)]*.10;}
let peak=0;
for(let i=0;i<n;i++){const t=i/rate;let e=Math.min(1,t/.012,(50-t)/.5);if(t>=30.1&&t<31)e=0;else if(t>=29.95&&t<30.1)e*=(30.1-t)/.15;left[i]*=e;right[i]*=e;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
const wav=Buffer.alloc(44+n*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*4,40);
const gain=.85/peak;for(let i=0;i<n;i++){wav.writeInt16LE(Math.round(left[i]*gain*32767),44+i*4);wav.writeInt16LE(Math.round(right[i]*gain*32767),46+i*4);}
fs.writeFileSync('public/audio/manga-teaser/denno-works-score.wav',wav);
console.log(JSON.stringify({seconds,bpm:144,key:'C major',bytes:wav.length,peak:.85,silence:[30.1,31]}));
