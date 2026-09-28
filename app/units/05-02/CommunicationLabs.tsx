import {Section,Guide,Terms,Details} from './Parts';
import {NetworkOverview} from './NetworkOverview';
import {NaptMotion} from './NaptMotion';

export function LanLab(){return <Section id="lan" n={2} title="家のLANの住所は、どこから来る？" blank="⑦・⑨〜⑫" page="p.131"><p className="in-lead">世界で管理する大きな範囲が接続事業者を通って家へ。家の中ではルータが別の番号を使います。</p><NetworkOverview/><div className="in-bridge"><b>家の中の住所と、外へ出る通信は別の話。</b><p>上では「住所や設定をどう受け取るか」を見ました。次は、同じ外側のIPを使うA・Bへ、Webページの返事をどう届けるかを追います。</p></div><NaptMotion/><Guide mood="understood"><b>家の中のIPと、通信を外へ出すときの番号は違う。</b><p>次の学習では、家の中で同じネットワークにいるのはどこまでか、マスクとゲートウェイの数字で確かめよう。</p></Guide><Details title="プライベートIPの範囲"><p>10.0.0.0/8、172.16.0.0/12、192.168.0.0/16 はプライベート用に定められた範囲です。別の家で同じ番号を使えても、同じ家のLANでは重複させません。固定IPを選ぶ場合も、DHCPの貸し出し範囲と衝突しないよう管理します。</p></Details><Terms section={2}/></Section>}
