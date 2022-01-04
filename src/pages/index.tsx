import { useMemo, useState } from 'react';
import type { NextPage } from 'next';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Container, Table, Button, Input, Grid, Col } from '@mantine/core';
import { useNotifications } from '@mantine/notifications';

import useDebounce from 'hooks/useDebounce';
import { FileUpload } from 'components/FileUpload';
import { groupedByMap, swapKeyValueOfObject } from 'utils';
import { getCSVContent, parseCSVString } from 'utils/csv';
import { HEADER_LABELS } from 'constants/header';
import { Actions, Trade } from 'types/trades';

// required for dayjs parsing to work in firefox
dayjs.extend(customParseFormat);

const labelKeyMap = Object.freeze(swapKeyValueOfObject(HEADER_LABELS));

const Home: NextPage = () => {
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const notifications = useNotifications();

  const searchTerm = useDebounce(search, 300);

  const data = useMemo(() => {
    if (records) {
      return searchTerm === ''
        ? records
        : records.filter(record => {
            const key = searchTerm.toLowerCase();
            return (
              record.symbol.toLowerCase().includes(key) ||
              record.name.toLowerCase().includes(key)
            );
          });
    }

    return null;
  }, [searchTerm, records]);

  function onDrop(file) {
    setIsLoading(true);
    parseTradesFile(file)
      .then(formatTrades)
      .then(setRecords)
      .then(() => {
        notifications.showNotification({
          color: 'green',
          autoClose: 2500,
          title: 'Success',
          message: `Successfully parsed - ${file[0].name}`,
        });
      })
      .catch(error => {
        notifications.showNotification({
          color: 'red',
          autoClose: 5000,
          title: 'Parsing Error',
          message: error?.message ?? 'Something went wrong!',
        });
        setRecords(null);
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function reset() {
    setRecords(null);
    setSearch('');
  }

  return (
    <Container>
      <header>
        <h3>Trade details</h3>
      </header>
      {data ? (
        <>
          <Grid justify={'space-between'} columns={7}>
            <Col span={2}>
              <Input
                size="sm"
                value={search}
                placeholder="Search"
                onChange={({ target: { value } }) => setSearch(value)}
              />
            </Col>
            <Col span={1}>
              <Button onClick={reset}>Clear Data</Button>
            </Col>
          </Grid>
          <div style={{ padding: 10 }} />
          <Table striped highlightOnHover>
            <caption>Total quantity traded Buy + Sell actions</caption>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th style={{ textAlign: 'right' }}>Trade Volume / Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.symbol}>
                  <td>{row.symbol}</td>
                  <td>{row.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    {Number(row.quantity).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div style={{ padding: 16 }} />
        </>
      ) : (
        <FileUpload
          onDrop={onDrop}
          isLoading={isLoading}
          accept={['application/vnd.ms-excel', 'text/csv']}
        />
      )}
    </Container>
  );
};

export default Home;

async function parseTradesFile(files: File[]): Promise<Trade[]> {
  const content = await getCSVContent(files[0]);
  return parseCSVString(content, {
    columnValueParser: key => {
      return labelKeyMap[key] as string;
    },
    rowValueParser: (header, value) => {
      if (['quantity', 'price'].includes(header)) {
        return Number(value.replaceAll(',', ''));
      } else if (header === 'date') {
        return dayjs(value, 'DD-MMM-YY').format('YYYY/MM/DD');
      }
      return value;
    },
  });
}

function formatTrades(trades: Trade[]): unknown[] {
  const result = Object.entries(groupedByMap(trades, 'symbol'))
    .map(([_, value]) => {
      const obj = { ...value[0], quantity: 0 };
      obj.constituents = value;

      value.forEach(curr => {
        if (curr.action === Actions.BUY) {
          obj.quantity += curr.quantity;
        } else if (curr.action === Actions.SELL) {
          obj.quantity -= curr.quantity;
        }
      });

      return obj;
    })
    .filter(val => val.quantity !== 0)
    // sort in descending order -> most bought first
    .sort((a, b) => b.quantity - a.quantity);

  return result;
}
