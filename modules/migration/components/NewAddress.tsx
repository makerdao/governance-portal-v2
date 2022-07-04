import { useState } from 'react';
import { NewAddressInitial } from 'modules/migration/components/NewAddressInitial';
import { NewAddressSuccess } from 'modules/migration/components/NewAddressSuccess';

export type NewAddressStatus = 'initial' | 'pending' | 'success' | 'error';

export function NewAddress(): JSX.Element {
  const [submissionStatus, setSubmissionStatus] = useState<NewAddressStatus>('initial');

  const handleSubmitNewAddress = () => {
    // TODO: here we will request a signature
    // then submit the request to our discord
    setSubmissionStatus('success');
  };

  return (
    <>
      {submissionStatus === 'initial' && (
        <NewAddressInitial handleSubmitNewAddress={handleSubmitNewAddress} />
      )}
      {submissionStatus === 'success' && <NewAddressSuccess />}
    </>
  );
}
