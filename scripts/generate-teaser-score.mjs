// Original 50-second electronic trailer score, synthesized locally. No samples.
import fs from 'node:fs';
const rate=44100, seconds=50, n=rate*seconds;
const left=new Float32Array(n),right=new Float32Array(n);
let seed=9214; const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
const hz=m=>440*2**((m-69)/12);
function voice(start,duration,midi,amp=.1,kind='pluck',pan=0){
 const f=hz(midi),a=Math.floor(start*rate),len=Math.floor(duration*rate);
 for(let j=0;j<len&&a+j<n;j++){const t=j/rate,u=j/len;
 const env=kind==='pad'?Math.min(1,t/.3)*Math.min(1,(duration-t)/.65):Math.min(1,t/.008)*Math.exp(-t*(kind==='bell'?2.2:5));
 const v=(Math.sin(2*Math.PI*f*t)+.25*Math.sin(2*Math.PI*f*2.003*t)+.12*Math.sin(2*Math.PI*f*3*t))*env*amp;
 left[a+j]+=v*Math.sqrt((1-pan)/2);right[a+j]+=v*Math.sqrt((1+pan)/2);
 }
}
function hit(start,amp=.3){for(let j=0;j<rate*.75;j++){const t=j/rate,k=Math.floor(start*rate)+j;if(k>=n)break;const v=Math.sin(2*Math.PI*(48*t+12*(1-Math.exp(-t*25))))*Math.exp(-t*8)*amp;left[k]+=v;right[k]+=v;}}
function whoosh(start,duration=.5,amp=.06){let smooth=0;for(let j=0;j<rate*duration;j++){const t=j/rate,k=Math.floor(start*rate)+j;if(k>=n)break;smooth=.7*smooth+.3*random();const v=smooth*Math.sin(Math.PI*t/duration)**2*amp;left[k]+=v*(1-t/duration);right[k]+=v*t/duration;}}
const chords=[[50,57,62,65,69],[46,53,58,62,65],[53,60,65,69,72],[48,55,60,64,67]];
// Spacious opening, then an arpeggio and pulse for each character.
[50,57,62,69].forEach((m,i)=>voice(i*.13,3,m,.075,'pad',i/5-.3));
for(let c=0;c<5;c++){
 const start=3+c*5,chord=chords[c%4];
 chord.forEach((m,i)=>voice(start,5,m,.045,'pad',(i-2)*.3));
 whoosh(start,.45,.15);hit(start,.18);
 for(let b=0;b<10;b++){const at=start+b*.5;voice(at,.7,chord[b%chord.length]+12,.085,'pluck',b%2?.35:-.35);if(b%2===0)hit(at,.13);if(b%2===1)whoosh(at,.08,.045);}
 voice(start+1,1.5,chord[3]+12,.12,'bell',.2);voice(start+2,1.5,chord[4]+12,.1,'bell',-.2);
}
// Rising anticipation followed by a genuine silence at 30.1–31 seconds.
whoosh(28,2.1,.25);[57,64,69].forEach(m=>voice(28,2,m,.055,'pad'));
// Broad major arrival, then room for the audience's applause.
hit(31,.55);whoosh(31,1.8,.3);
[50,57,62,66,69,74].forEach((m,i)=>voice(31+i*.045,5,m,.1,'pad',(i-2.5)*.2));
[74,78,81,86].forEach((m,i)=>voice(31+i*.17,3,m,.12,'bell',(i-1.5)*.3));
for(let bar=0;bar<3;bar++){const start=36+bar*3,chord=chords[(bar+1)%4];chord.forEach((m,i)=>voice(start,3,m,.055,'pad',(i-2)*.25));for(let b=0;b<6;b++){voice(start+b*.5,.9,chord[b%5]+12,.075,'pluck',b%2?.3:-.3);if(b%2===0)hit(start+b*.5,.1);}}
[41,42.333,43.666].forEach(t=>whoosh(t,.35,.18));
hit(45,.3);[50,57,62,66,69,74].forEach((m,i)=>voice(45,4.9,m,.075,'pad',(i-2.5)*.22));
[81,78,74].forEach((m,i)=>voice(45+i*.5,3,m,.12,'bell'));
// Light stereo echoes; hard silence before announcement and final fade.
for(let i=n-1;i>=rate*.23;i--){left[i]+=right[i-Math.floor(rate*.23)]*.17;right[i]+=left[i-Math.floor(rate*.31)]*.13||0;}
let peak=0;for(let i=0;i<n;i++){const t=i/rate;let envelope=Math.min(1,t/.06,(50-t)/1.5);if(t>=30.1&&t<31)envelope=0;else if(t>=29.9&&t<30.1)envelope*= (30.1-t)/.2;left[i]*=envelope;right[i]*=envelope;peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
const wav=Buffer.alloc(44+n*4);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*4,40);
const gain=.82/peak;for(let i=0;i<n;i++){wav.writeInt16LE(Math.round(left[i]*gain*32767),44+i*4);wav.writeInt16LE(Math.round(right[i]*gain*32767),46+i*4);}
fs.writeFileSync('public/audio/manga-teaser/denno-works-score.wav',wav);
console.log(JSON.stringify({seconds,rate,bytes:wav.length,peak:.82,silence:[30.1,31]}));
