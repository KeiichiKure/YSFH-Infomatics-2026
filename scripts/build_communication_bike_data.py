"""Package the UCI Bike Sharing hour.csv without inventing observations.

Usage: python scripts/build_communication_bike_data.py path/to/bike-sharing.zip
The original CSV and README are preserved; selected columns are encoded in JSON.
"""
from pathlib import Path
import csv
import hashlib
import io
import json
import sys
import zipfile

repo = Path(__file__).resolve().parents[1]
archive = Path(sys.argv[1])
target = repo / 'public' / 'data' / '02-04'
target.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(archive) as source:
    raw = source.read('hour.csv')
    readme = source.read('Readme.txt')
rows = list(csv.DictReader(io.StringIO(raw.decode('utf-8'))))
columns = ['dteday', 'hr', 'workingday', 'weathersit', 'temp', 'cnt', 'casual', 'registered']
records = [[r[c] if c == 'dteday' else float(r[c]) if c == 'temp' else int(r[c]) for c in columns] for r in rows]
assert len(records) == 17379
assert all(r[5] == r[6] + r[7] for r in records)
total = sum(r[5] for r in records)
assert total == 3292679
(target / 'hour.csv').write_bytes(raw)
(target / 'source-readme.txt').write_bytes(readme)
dataset = {'records': records, 'rowCount': len(records), 'rentalTotal': total}
(target / 'bike-hour.json').write_text(json.dumps(dataset, separators=(',', ':')), encoding='utf-8')
provenance = {
    'title': 'Bike Sharing', 'author': 'Hadi Fanaee-T', 'year': 2013,
    'source': 'https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset',
    'doi': 'https://doi.org/10.24432/C5W894',
    'download': 'https://archive.ics.uci.edu/static/public/275/bike+sharing+dataset.zip',
    'license': 'CC BY 4.0', 'licenseUrl': 'https://creativecommons.org/licenses/by/4.0/',
    'retrieved': '2026-10-02', 'hourCsvSha256': hashlib.sha256(raw).hexdigest(),
    'columns': columns, 'rowCount': len(records), 'rentalTotal': total,
    'period': [records[0][0], records[-1][0]],
    'changes': 'All hourly rows retained. Selected columns parsed as numbers; original normalized temperature retained. No synthetic rows or zero-filled missing hours. Browser filters and averages these rows.',
    'temperatureNote': 'The legacy ZIP README and current UCI webpage describe Celsius conversion differently. This lesson avoids that inconsistency by preserving temp as a normalized index and never converting to Celsius.',
    'countsNote': 'UCI landing-page Instances says 17389, but the downloaded hour.csv and ZIP README have 17379 hourly records. Counts here are verified from the actual file.',
}
(target / 'provenance.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(records):,} observed hours; {total:,} rentals; source SHA256 {provenance["hourCsvSha256"]}')
