import {terms} from './lessonData';
export function explainChoice(term:string,context:string){
 const definition=terms.find(t=>t.term===term)?.definition??'情報の伝え方を考えるための言葉です。';
 return `${term}とは、${definition} ${context} もう一度考えてみよう。`;
}
