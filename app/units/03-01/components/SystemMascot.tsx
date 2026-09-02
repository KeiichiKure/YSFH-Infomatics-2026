import inputMascot from '@/public/images/03-01-mascot-input.png';
import controlMascot from '@/public/images/03-01-mascot-control.png';
import arithmeticMascot from '@/public/images/03-01-mascot-arithmetic.png';
import memoryMascot from '@/public/images/03-01-memory-centered.png';
import outputMascot from '@/public/images/03-01-mascot-output.png';
import storageMascot from '@/public/images/03-01-mascot-storage.png';
import appMascot from '@/public/images/03-01-mascot-app.png';
import osMascot from '@/public/images/03-01-os-centered.png';
import driverMascot from '@/public/images/03-01-mascot-driver.png';
import printerMascot from '@/public/images/03-01-mascot-printer.png';

export type SystemMascotName = 'input' | 'control' | 'arithmetic' | 'memory' | 'storage' | 'output' | 'app' | 'os' | 'driver' | 'printer';

const portraits: Record<SystemMascotName, string> = {
  input: inputMascot.src,
  control: controlMascot.src,
  arithmetic: arithmeticMascot.src,
  memory: memoryMascot.src,
  output: outputMascot.src,
  storage: storageMascot.src,
  app: appMascot.src,
  os: osMascot.src,
  driver: driverMascot.src,
  printer: printerMascot.src,
};

export function SystemMascot({ name, label, active = false, small = false, portrait = false, showLabel = true }: { name: SystemMascotName; label: string; active?: boolean; small?: boolean; portrait?: boolean; showLabel?: boolean }) {
  return <div className={`system-mascot ${active ? 'is-active' : ''} ${small ? 'is-small' : ''} ${portrait ? 'is-portrait' : ''}`}>
    <span className="system-mascot-image" role="img" aria-label={label} style={{ backgroundImage: `url(${portraits[name]})`, backgroundPosition: '50% 50%', backgroundSize: 'contain' }} />
    {showLabel && <b>{label}</b>}
  </div>;
}
