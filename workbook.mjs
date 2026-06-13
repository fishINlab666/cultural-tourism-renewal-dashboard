import { FIELD_DEFINITIONS } from './data.mjs';

const labelToKey = new Map(FIELD_DEFINITIONS.map((field) => [field.label, field.key]));
const numberFields = new Set(FIELD_DEFINITIONS.filter((field) => field.type === 'number').map((field) => field.key));

function decodeXml(value) {
  return String(value ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&');
}

function columnIndex(reference) {
  const letters = reference.match(/^[A-Z]+/)?.[0] ?? 'A';
  return [...letters].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function findEndOfCentralDirectory(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  throw new Error('无法识别 Excel 文件结构');
}

async function inflateRaw(compressed) {
  if (typeof DecompressionStream === 'undefined') throw new Error('当前浏览器不支持 Excel 解压，请使用最新版 Chrome、Edge 或 Safari');
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unzipEntries(input) {
  const bytes = input instanceof Uint8Array
    ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
    : new Uint8Array(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  const eocd = findEndOfCentralDirectory(bytes);
  const entriesCount = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  const entries = new Map();

  for (let index = 0; index < entriesCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('Excel 文件目录损坏');
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.slice(offset + 46, offset + 46 + fileNameLength));
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataOffset, dataOffset + compressedSize);
    let content;

    if (method === 0) content = compressed;
    else if (method === 8) content = await inflateRaw(compressed);
    else throw new Error(`暂不支持 Excel 压缩方式 ${method}`);

    entries.set(name.replace(/^\//, ''), content);
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) => {
    const parts = [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((part) => decodeXml(part[1]));
    return parts.join('');
  });
}

function resolveProjectSheet(entries, decoder) {
  const workbook = decoder.decode(entries.get('xl/workbook.xml') ?? new Uint8Array());
  const relationships = decoder.decode(entries.get('xl/_rels/workbook.xml.rels') ?? new Uint8Array());
  const sheet = [...workbook.matchAll(/<sheet\b([^>]*)\/?\s*>/g)]
    .map((match) => match[1])
    .find((attributes) => /name="项目基础数据"/.test(attributes));
  const relationId = sheet?.match(/r:id="([^"]+)"/)?.[1];

  if (!relationId) return 'xl/worksheets/sheet2.xml';
  const relationship = [...relationships.matchAll(/<Relationship\b([^>]*)\/?\s*>/g)]
    .map((match) => match[1])
    .find((attributes) => new RegExp(`Id="${relationId}"`).test(attributes));
  let target = relationship?.match(/Target="([^"]+)"/)?.[1] ?? 'worksheets/sheet2.xml';
  target = target.replace(/^\//, '');
  return target.startsWith('xl/') ? target : `xl/${target.replace(/^\.\//, '')}`;
}

function parseSheetRows(xml, sharedStrings) {
  const rows = new Map();
  for (const match of xml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
    const attributes = match[1];
    const content = match[2];
    const reference = attributes.match(/r="([A-Z]+\d+)"/)?.[1];
    if (!reference) continue;
    const rowNumber = Number(reference.match(/\d+$/)?.[0]);
    const type = attributes.match(/t="([^"]+)"/)?.[1];
    let value = '';

    if (type === 'inlineStr') {
      value = [...content.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((part) => decodeXml(part[1])).join('');
    } else {
      const raw = content.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? '';
      value = type === 's' ? sharedStrings[Number(raw)] ?? '' : decodeXml(raw);
    }

    if (!rows.has(rowNumber)) rows.set(rowNumber, []);
    rows.get(rowNumber)[columnIndex(reference)] = value;
  }
  return [...rows.entries()].sort(([a], [b]) => a - b).map(([, cells]) => cells);
}

export function mapWorkbookRows(rows) {
  const project = {};
  for (const row of rows) {
    const label = String(row[0] ?? '').trim();
    const key = labelToKey.get(label);
    if (!key) continue;
    const raw = row[1] ?? '';
    project[key] = numberFields.has(key) && raw !== '' ? Number(raw) : String(raw).trim();
  }
  if (project.name) project.district = project.name;
  return project;
}

export async function parseWorkbookBuffer(input) {
  const entries = await unzipEntries(input);
  const decoder = new TextDecoder();
  const sharedStrings = parseSharedStrings(entries.has('xl/sharedStrings.xml') ? decoder.decode(entries.get('xl/sharedStrings.xml')) : '');
  const sheetPath = resolveProjectSheet(entries, decoder);
  const sheetBytes = entries.get(sheetPath);
  if (!sheetBytes) throw new Error('Excel 中缺少“项目基础数据”工作表');
  const rows = parseSheetRows(decoder.decode(sheetBytes), sharedStrings);
  const project = mapWorkbookRows(rows);
  if (!Object.keys(project).length) throw new Error('未读取到项目字段，请使用系统模板填写');
  return project;
}

export async function parseWorkbook(file) {
  if (!file || !file.name.toLowerCase().endsWith('.xlsx')) throw new Error('请上传 .xlsx 格式的项目模板');
  return parseWorkbookBuffer(await file.arrayBuffer());
}
