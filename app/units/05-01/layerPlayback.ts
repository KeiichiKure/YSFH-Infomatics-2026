export type LayerPlayback={step:number;playing:boolean;loss:boolean;appliedLoss:boolean|null};
export const initialPlayback:LayerPlayback={step:0,playing:false,loss:false,appliedLoss:null};
export function moveLayer(state:LayerPlayback,step:number,gate:number):LayerPlayback{
 return {...state,step,appliedLoss:step<gate?null:state.appliedLoss??state.loss};
}
