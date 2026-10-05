import { readFile, writeFile } from 'node:fs/promises';

const result = {};
for (const name of ['risk', 'pyro', 'miku', 'notes']) {
  const bytes = await readFile(new URL(`./portfolio/audio/${name}.wav`, import.meta.url));
  let offset = 12;
  while (offset + 8 < bytes.length && bytes.toString('ascii', offset, offset + 4) !== 'data') {
    offset += 8 + bytes.readUInt32LE(offset + 4);
  }
  if (offset + 8 >= bytes.length) throw new Error(`No audio data in ${name}.wav`);
  const start = offset + 8;
  const count = Math.floor(bytes.readUInt32LE(offset + 4) / 2);
  const buckets = 72;
  const peaks = [];
  for (let bucket = 0; bucket < buckets; bucket++) {
    const from = Math.floor(bucket * count / buckets);
    const to = Math.floor((bucket + 1) * count / buckets);
    let peak = 0;
    for (let sample = from; sample < to; sample++) {
      peak = Math.max(peak, Math.abs(bytes.readInt16LE(start + sample * 2)));
    }
    peaks.push(Math.round(Math.max(0.12, peak / 32768) * 100));
  }
  result[name] = peaks;
}
await writeFile(new URL('./portfolio/waveforms.json', import.meta.url), JSON.stringify(result));
