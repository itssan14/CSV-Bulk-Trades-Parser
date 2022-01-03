import { pipe, noop, identity } from '.';

const trimFn = str => str.trim();
const mapFn = fn => arr => arr.map(fn);
const match = separator => str => str.match(separator);
const split = separator => str => str.split(separator);
/* --- --- --- --- --- --- --- --- */
const valueParser = (_key, value) => value;
const rowParser: (value: string) => string = pipe(
  match(/(\s*"[^"]+"\s*|\s*[^,]+|,)(?=,|$)/g), // escape comma inside quotes
  mapFn(trimFn)
);
const replaceAll =
  (target: any, replaceWith: string) =>
  (str: string): string =>
    str.replaceAll(target, replaceWith);
const contentParser: (content: string) => string[] = pipe(
  trimFn,
  split(/\r\n|\n/)
);

type ParserProps = {
  validateHeader?: (header: string) => void;
  validateContentRow?: (
    row: { [x: string]: unknown },
    rowNumber: number
  ) => void;
  rowValueParser?: (header: string, value: string) => unknown;
  columnValueParser?: (value: string) => string;
};

export function parseCSVString(
  csvContent: string,
  {
    validateHeader = noop,
    validateContentRow = noop,
    rowValueParser = valueParser,
    columnValueParser = identity,
  }: ParserProps = {}
) {
  const [headerRow, ...contentRows] = contentParser(csvContent);
  // the first row expected to be the header of the CSV
  const headers = rowParser(headerRow);

  const headerSet = new Set();
  const parseHead = pipe(replaceAll(`\"`, ''), trimFn, columnValueParser);
  for (let [idx, header] of Object.entries(headers)) {
    // format the header name to a custom format
    header = parseHead(header);
    // check for header values that are unexpected or duplicated
    //  in the uploaded file
    if (header === undefined) {
      throw Error('CSV contains unexpected headers');
    } else if (headerSet.has(header)) {
      throw Error('CSV contains 1 or more headers with same name.');
    }
    validateHeader(header);
    headerSet.add(header);
    headers[idx] = header;
  }

  const csvBody = [];
  for (const [rowNumber, row] of Object.entries(contentRows)) {
    let contentRow = {};
    const parseValue = pipe(replaceAll(`\"`, ''), trimFn);
    for (const [key, rowItem] of Object.entries(rowParser(row))) {
      contentRow[headers[key]] = rowValueParser(
        headers[key],
        parseValue(rowItem)
      );
    }
    validateContentRow(contentRow, Number.parseInt(rowNumber, 10) + 1);
    csvBody.push(contentRow);
  }

  if (headers.length === 0 || csvBody.length === 0) {
    throw Error('CSV cannot be empty');
  }

  return csvBody;
}

export async function getCSVContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const csvContent = reader.result as string;
        resolve(csvContent);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
}
