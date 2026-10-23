/* Owner-only cleanup. Match identified test IDs, never class names/numeric codes. */
function testLessonIds_(lessons) {
  const legacy=new Set(['88597275-40fe-4f73-92e6-76b36e512057','6146b3a8-c7f9-4fa7-84ce-5873ce58b6db','e7c09133-9906-4a74-bc1d-0f7b8358565b','7e64abdd-11e4-480a-bc2a-f51b2f8553cc','495ac8b2-def6-49b5-b356-997b965d5b4e','1f98b2e3-02b7-4b0d-b26c-152cf3e55361','39658367-3154-4242-9615-f7b8a04af5a1','fea13b04-3a51-454e-bab4-b0ed21fa82fb']);
  const ids=new Set();lessons.forEach(r=>{const meta=r[8]?JSON.parse(r[8]):{},id=r[0]||meta.id;if(id&&(legacy.has(id)||meta.testing===true||/^loadtest-/.test(id)))ids.add(id);});return ids;
}
function testCleanupPlan_(store) {
  const ids=testLessonIds_(store.lessons),pick=(rows,meta)=>rows.map((data,i)=>({row:i+2,data})).filter(x=>ids.has(x.data[0]||(meta&&x.data[8]?JSON.parse(x.data[8]).id:'')));
  return {ids:[...ids],lessons:pick(store.lessons,true),votes:pick(store.votes,false),receipts:pick(store.receipts,false)};
}
function archiveTestData_() {
  const result=withLock_(()=>{
    flushInboxLocked_(true);const t=tables_(),plan=testCleanupPlan_(loadStore_(t));
    if(!plan.ids.length)return {lessons:0,votes:0,receipts:0,backups:[]};
    const suffix=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14),backups=[];
    // All backups must be written and verified BEFORE deleting any source rows.
    ['lessons','votes','receipts'].forEach(key=>{
      const entries=plan[key];if(!entries.length)return;const source=t[key],width=source.getLastColumn(),name='退避_'+suffix+'_'+source.getName(),sh=t.ss.insertSheet(name);
      // Sheets may coerce booleans/numbers when formatting copied cells. Keep an
      // exact JSON row alongside the readable columns and verify that copy.
      const originals=entries.map(x=>JSON.stringify(x.data)),data=[[...source.getRange(1,1,1,width).getValues()[0],'元データ（復元用JSON）'],...entries.map((x,i)=>[...x.data,originals[i]])];
      sh.getRange(1,1,data.length,width+1).setNumberFormat('@');sh.getRange(1,1,data.length,width+1).setValues(data);
      SpreadsheetApp.flush();if(JSON.stringify(sh.getRange(2,width+1,originals.length,1).getValues().map(r=>r[0]))!==JSON.stringify(originals))throw new Error('退避の確認ができなかったため削除しませんでした。');
      sh.setFrozenRows(1);backups.push(name);
    });
    ['receipts','votes','lessons'].forEach(key=>{
      const rows=plan[key].map(x=>x.row).sort((a,b)=>b-a);let start=null,count=0;
      const remove=()=>{if(count)t[key].deleteRows(start,count);};
      rows.forEach(row=>{if(start!==null&&row===start-1){start=row;count++;}else{remove();start=row;count=1;}});remove();
    });
    const p=pollProperties_();if(plan.ids.includes(p.getProperty('POLL_TEST_ID'))){['POLL_TEST_ID','POLL_TEST_KEY','POLL_TEST_CODE'].forEach(k=>p.deleteProperty(k));}
    if(plan.ids.includes(p.getProperty('CURRENT_LESSON')))p.deleteProperty('CURRENT_LESSON');
    SpreadsheetApp.flush();invalidate_('community');
    return {lessons:plan.lessons.length,votes:plan.votes.length,receipts:plan.receipts.length,backups};
  });
  console.log(JSON.stringify(result));SpreadsheetApp.getUi().alert('テストデータの整理','授業：'+result.lessons+'件 ／ 回答：'+result.votes+'件 ／ 送信記録：'+result.receipts+'件\n元データは「退避_」で始まるシートに保存しています。実際の授業・全体投票の回答は変更しません。',SpreadsheetApp.getUi().ButtonSet.OK);
}
