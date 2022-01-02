import { useState } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { NextPage } from 'next';
import { FileUpload } from 'components/FileUpload';
import { swapKeyValueOfObject } from 'utils';
import { getCSVContent, parseCSVString } from 'utils/csv';

// required for dayjs parsing to work in firefox
dayjs.extend(customParseFormat);

import { HEADER_LABELS } from 'constants/header';
const labelKeyMap = Object.freeze(swapKeyValueOfObject(HEADER_LABELS));

const Home: NextPage = () => {
  const [records, setRecords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function onDrop(file) {
    setIsLoading(true);
    parseTradesFile(file)
      .then(setRecords)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }

  return (
    <section>
      <header>
        <h3>Upload bulk CSV here</h3>
      </header>
      <FileUpload
        onDrop={onDrop}
        isLoading={isLoading}
        accept={['application/vnd.ms-excel', 'text/csv']}
      />
      {records && <pre>{JSON.stringify(records, null, 2)}</pre>}
    </section>
  );
};

export default Home;

async function parseTradesFile(file: File[]) {
  const content = await getCSVContent(file);
  const result = parseCSVString(content, {
    columnValueParser: key => {
      return labelKeyMap[key] as string;
    },
    rowValueParser: (header, value) => {
      if (['quantity', 'price'].includes(header)) {
        return Number(value.replaceAll(`\"`, '').replaceAll(',', ''));
      } else if (header === 'date') {
        return dayjs(value, 'DD-MMM-YY').format('YYYY/MM/DD');
      }
      return value;
    },
  });

  console.log({ result });
  return result;
}
