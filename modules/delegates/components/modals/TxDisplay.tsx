/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { TxInProgress } from 'modules/app/components/TxInProgress';
import { TxFinal } from 'modules/app/components/TxFinal';
import { TxStatus } from 'modules/web3/constants/transaction';
import { Dispatch, SetStateAction } from 'react';

export const TxDisplay = ({
  txStatus,
  setTxStatus,
  txHash,
  setTxHash,
  onDismiss,
  children,
  title = 'Transaction Sent',
  description = 'Delegate contract will update once the transaction has been confirmed.'
}: {
  txStatus: TxStatus;
  setTxStatus: Dispatch<SetStateAction<TxStatus>>;
  txHash: `0x${string}` | undefined;
  setTxHash: Dispatch<SetStateAction<`0x${string}` | undefined>>;
  children?: React.ReactNode;
  onDismiss: () => void;
  title?: string;
  description?: string;
}): React.ReactElement => {
  switch (txStatus) {
    case TxStatus.SUCCESS:
      return (
        <TxFinal
          title={title}
          description={description}
          buttonLabel="Close"
          onClick={onDismiss}
          txHash={txHash}
          success={true}
        >
          {children}
        </TxFinal>
      );
    case TxStatus.ERROR:
      return (
        <TxFinal
          title="Transaction Failed"
          description="An error occured. Please check the link below for more information."
          buttonLabel="Close"
          onClick={onDismiss}
          txHash={txHash}
          success={false}
        />
      );
    default:
      return (
        <TxInProgress txStatus={txStatus} setTxStatus={setTxStatus} txHash={txHash} setTxHash={setTxHash} />
      );
  }
};
