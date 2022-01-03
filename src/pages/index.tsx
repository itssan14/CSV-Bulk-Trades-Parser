import { useState } from 'react';
import type { NextPage } from 'next';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Container, Table } from '@mantine/core';
import { useNotifications } from '@mantine/notifications';

import { FileUpload } from 'components/FileUpload';
import { groupedByMap, swapKeyValueOfObject } from 'utils';
import { getCSVContent, parseCSVString } from 'utils/csv';

enum Actions {
  BUY = 'BUY',
  SELL = 'SELL',
}

// required for dayjs parsing to work in firefox
dayjs.extend(customParseFormat);

import { HEADER_LABELS } from 'constants/header';
const labelKeyMap = Object.freeze(swapKeyValueOfObject(HEADER_LABELS));

const Home: NextPage = () => {
  const [records, setRecords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const notifications = useNotifications();

  function onDrop(file) {
    (async function () {
      try {
        setIsLoading(true);
        const trades = await parseTradesFile(file);
        const results = Object.entries(groupedByMap(trades, 'symbol'))
          .map(([_, value]) => {
            const [first, ...rest] = value;
            let obj = Object.assign({}, first);

            delete obj.client;
            delete obj.action;
            delete obj.remarks;
            delete obj.price;

            rest.forEach(curr => {
              if (curr.action === Actions.BUY) {
                obj.quantity += curr.quantity;
              } else if (curr.action === Actions.SELL) {
                obj.quantity -= curr.quantity;
              }
            });

            return obj;
          })
          .filter(val => val.quantity !== 0);

        setRecords(results);
      } catch (error) {
        notifications.showNotification({
          color: 'red',
          autoClose: 5000,
          title: 'Parsing Error',
          message: error?.message ?? 'Something went wrong!',
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }

  return (
    <Container>
      <header>
        <h3>Upload bulk CSV here</h3>
      </header>
      <FileUpload
        onDrop={onDrop}
        isLoading={isLoading}
        accept={['application/vnd.ms-excel', 'text/csv']}
      />
      {records ? (
        <>
          <div style={{ margin: '24px 0' }} />
          <Table striped highlightOnHover>
            <caption>Total quantity traded Buy + Sell actions</caption>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Date</th>
                <th>Name</th>
                <th style={{ textAlign: 'right' }}>Trade Volume / Quantity</th>
              </tr>
            </thead>
            <tbody>
              {records.map(element => (
                <tr key={element.symbol}>
                  <td>{element.date}</td>
                  <td>{element.symbol}</td>
                  <td>{element.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    {Number(element.quantity).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : null}
    </Container>
  );
};

export default Home;

async function parseTradesFile(files: File[]) {
  const content = await getCSVContent(files[0]);
  return parseCSVString(content, {
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
}
