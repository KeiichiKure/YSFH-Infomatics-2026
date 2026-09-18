export const serviceExamples=[
 {intent:'Webページを見たい',protocol:'HTTP',tcp:true,port:80,server:'Webサーバ',request:'GET /festival',requestLabel:'文化祭ページをください',response:'HTTP 200 OK',pieces:['① 日時','② 会場','③ 案内'],result:'文化祭｜9月20日・体育館',why:'Webページを要求して返してもらう取り決めがHTTP。「GET /festival」は、そのページをください、という要求。',portNote:'80＝暗号化しないHTTPサーバの標準的な入口番号。HTTPSでは通常443を使う。'},
 {intent:'届いたメールを受信したい',protocol:'POP（POP3）',tcp:true,port:110,server:'メールサーバ',request:'RETR 1',requestLabel:'1通目のメールをください',response:'+OK メールの内容',pieces:['① 件名','② 本文','③ 署名'],result:'受信メール｜文化祭のお知らせ',why:'サーバに届いているメールを取り出す取り決めがPOP。「RETR 1」は1通目を取り出して、という要求。',portNote:'110＝暗号化しないPOP3サーバの標準的な入口番号。暗号化する接続では通常995を使う。'},
 {intent:'配信中の動画を見たい',protocol:'配信アプリの取り決め',tcp:false,port:5004,server:'配信サーバ',request:'ライブを送って',requestLabel:'ライブを見たい',response:'動画のデータ',pieces:['① 映像A','② 映像B','③ 映像C'],result:'▶ 文化祭ライブ',why:'この配信アプリは、遅れを抑えるためUDPを使う例。HTTPやPOPとは別の取り決めで配信を依頼する。',portNote:'5004＝この配信例で使う入口番号。すべての動画配信で同じ番号を使うわけではない。'},
];
export type ServiceExample=typeof serviceExamples[number];
