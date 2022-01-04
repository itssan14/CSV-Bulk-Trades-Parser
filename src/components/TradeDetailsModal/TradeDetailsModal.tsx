import { FunctionComponent } from 'react';
import { Modal, Table } from '@mantine/core';
import { Actions } from 'types/trades';

import styles from './TradeDetailsModal.module.scss';

interface Props {
  data: any;
  onClose: () => void;
}

export const TradeDetailsModal: FunctionComponent<Props> = ({
  data,
  onClose,
}) => {
  if (!data) {
    return null;
  }

  return (
    <Modal
      opened={true}
      onClose={onClose}
      size="70vw"
      title={<b>Actions on {data?.symbol}</b>}
      centered
      overflow="inside"
      padding="sm"
    >
      <Table striped highlightOnHover className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Client</th>
            <th>Action</th>
            <th style={{ textAlign: 'right' }}>Trade Volume / Quantity</th>
          </tr>
        </thead>
        <tbody>
          {data.constituents.map(row => (
            <tr key={row.symbol}>
              <td>{row.date}</td>
              <td>{row.client}</td>
              <td>{row.action}</td>
              <td style={{ textAlign: 'right' }}>
                {row.action === Actions.BUY ? '(+) ' : '(-) '}
                {Number(row.quantity).toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th style={{ textAlign: 'right' }}>
              {Number(data.quantity).toLocaleString('en-IN')}
            </th>
          </tr>
        </tfoot>
      </Table>
    </Modal>
  );
};
