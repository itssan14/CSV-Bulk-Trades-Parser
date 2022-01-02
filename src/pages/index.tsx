import { useState } from 'react';
import dayjs from 'dayjs';
import type { NextPage } from 'next';
import { FileUpload } from 'components/FileUpload';
import { swapKeyValueOfObject } from 'utils';
import { getCSVContent, parseCSVString } from 'utils/csv';

import { HEADER_LABELS } from 'constants/header';

const Home: NextPage = () => {
  const [records, setRecords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onDrop(file) {
    try {
      setIsLoading(true);
      const content = await getCSVContent(file);
      const ax = swapKeyValueOfObject(HEADER_LABELS);

      const result = parseCSVString(content, {
        columnValueParser: key => {
          if (!ax[key]) {
            throw Error(`${key} is not a valid column`);
          }
          return ax[key] as string;
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

      setRecords(result);
    } catch (_err) {
      console.log('Error', _err);
    } finally {
      setIsLoading(false);
    }
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
      <pre>{JSON.stringify(records, null, 2)}</pre>
    </section>
  );
};

export default Home;
