'use client';
import {useState,useEffect,type SetStateAction} from 'react';
import {layerFlow} from './experienceModel';
import {initialPlayback,moveLayer} from './layerPlayback';
export function useLayerPlayer(tcp:boolean){
 const [state,setState]=useState(initialPlayback);const flow=layerFlow(tcp,state.appliedLoss??state.loss);const max=flow.length-1;const gate=flow.findIndex(s=>s.response&&s.hop===1);const delay=flow[state.step]?.hop!==undefined?650:2100;
 useEffect(()=>{if(!state.playing||state.step>=max)return;const timer=setTimeout(()=>setState(s=>moveLayer(s,s.step+1,gate)),delay);return()=>clearTimeout(timer)},[state.playing,state.step,max,delay,gate]);
 const p={step:state.step,playing:state.playing&&state.step<max,setStep:(v:SetStateAction<number>)=>setState(s=>moveLayer(s,typeof v==='function'?v(s.step):v,gate)),setPlaying:(v:SetStateAction<boolean>)=>setState(s=>({...s,playing:typeof v==='function'?v(s.playing):v})),reset:()=>setState(s=>({...s,step:0,playing:false,appliedLoss:null}))};
 return {p,flow,loss:state.loss,toggleLoss:()=>setState(s=>({...s,loss:!s.loss})),pending:state.appliedLoss!==null&&state.appliedLoss!==state.loss};
}
