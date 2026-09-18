export type FlowStep={side:'client'|'server'|'wire';layer:number;depth:number;title:string;note:string;response:boolean;received:number[];ack?:boolean;inspect?:number;hop?:number;lost?:boolean;retry?:boolean};
export function layerFlow(tcp:boolean,loss:boolean):FlowStep[]{
 const result:FlowStep[]=[];
 const add=(side:FlowStep['side'],layer:number,depth:number,title:string,response=false,received:number[]=[],extra:Partial<FlowStep>={})=>result.push({side,layer,depth,title,note:title,response,received,...extra});
 add('client',4,0,'依頼を作ろう');
 for(const response of [false,true]){
  const from=response?'server':'client',to=response?'client':'server';
  add(from,4,1,response?'サーバが返事を作る':'アプリの要求を作る',response);
  add(from,3,2,'順序・チェックサムなどを付ける',response);
  add(from,2,3,'IPを付ける',response);
  add(from,1,4,'次の区間のMACとFCSを付ける',response);
  for(let hop=0;hop<5;hop++)add('wire',1,4,hop===1&&response&&loss?'②が回線上で失われた':'経路を進む',response,response&&loss&&hop>=1?[1,3]:[],{hop,lost:response&&loss&&hop>=1});
  const received=response?(loss?[1,3]:[1,2,3]):[];
  for(const layer of [1,2]){
   add(to,layer,5-layer,`${layer}層：外す前に確認`,response,received,{inspect:layer});
   add(to,layer,4-layer,`${layer}層：確認した包みを外す`,response,received);
  }
  if(response&&loss){
   add(to,3,2,'②が途中で失われた',true,[1,3]);
   if(tcp){
    add('client',3,2,'確認応答を作る',true,[1,3],{ack:true});
    add('client',2,3,'確認応答にIPを付ける',true,[1,3],{ack:true});
    add('client',1,4,'確認応答にMACとFCSを付ける',true,[1,3],{ack:true});
    for(let hop=0;hop<5;hop++)add('wire',1,4,'確認応答がサーバへ戻る',true,[1,3],{ack:true,hop});
    for(const layer of [1,2]){
     add('server',layer,5-layer,'確認応答の包みを確認',true,[1,3],{ack:true,inspect:layer});
     add('server',layer,4-layer,'確認応答の包みを外す',true,[1,3],{ack:true});
    }
    add('server',3,2,'確認応答をTCPが読む',true,[1,3],{ack:true,inspect:3});
    add('server',3,2,'送信側が②を再送する',true,[1,3],{retry:true});
    add('server',2,3,'再送する②にIPを付ける',true,[1,3],{retry:true});
    add('server',1,4,'再送する②にMACとFCSを付ける',true,[1,3],{retry:true});
    for(let hop=0;hop<5;hop++)add('wire',1,4,hop===4?'②が端末へ届く':'②を再送中',true,hop===4?[1,2,3]:[1,3],{hop,retry:true});
    for(const layer of [1,2]){
     add(to,layer,5-layer,'再送の包みを確認',true,[1,2,3],{inspect:layer,retry:true});
     add(to,layer,4-layer,'再送の包みを外す',true,[1,2,3],{retry:true});
    }
   }
  }
  const finalReceived=response?(loss&&!tcp?[1,3]:[1,2,3]):[];
  add(to,3,2,'3層：チェックサムを照合',response,finalReceived,{inspect:3});
  add(to,3,1,'3層：確認した包みを外す',response,finalReceived);
  add(to,4,0,response?'端末の画面に表示':'サーバが要求を読む',response,finalReceived);
 }
 return result;
}
// Ethernet switches forward an existing frame; only routers replace its link header.
export function routeDestination(s:FlowStep,serverSuffix:string){
 const reply=s.response&&!s.ack;const hop=s.side==='wire'?(s.hop??0):s.side===(reply?'client':'server')?4:0;
 const destination=reply?(hop<1?'02':hop<2?'01':'10'):(hop<2?'01':hop<3?'02':serverSuffix);
 return {mac:`02:00:00:00:00:${destination}`,name:destination===serverSuffix?'相手サーバ':destination==='10'?'自分の端末':destination==='01'?'学校ルータ':'校外ルータ'};
}
