import Image from 'next/image';
export function SceneImage({ name, alt, basePath }: { name: string; alt: string; basePath: string }) {
  return <Image className="cm-scene-image" src={`${basePath}/images/02-04/${name}.webp`} width={1536} height={1024} alt={alt} unoptimized />;
}
