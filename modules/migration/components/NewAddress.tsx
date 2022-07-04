import { useState } from 'react';
import { NewAddressInitial } from 'modules/migration/components/NewAddressInitial';
import { NewAddressSuccess } from 'modules/migration/components/NewAddressSuccess';
import { NewAddressError } from 'modules/migration/components/NewAddressError';

export type NewAddressStatus = 'initial' | 'pending' | 'success' | 'error';

export function NewAddress({
  handleSubmitNewAddress
}: {
  handleSubmitNewAddress: (newAddress: string) => Promise<Response>;
}): JSX.Element {
  const [submissionStatus, setSubmissionStatus] = useState<NewAddressStatus>('initial');

  const handleSubmit = async (newAddress: string) => {
    // TODO: here we will request a signature
    try {
      const req = await handleSubmitNewAddress(newAddress);
      if (req.status === 200) {
        setSubmissionStatus('success');
      } else {
        setSubmissionStatus('error');
      }
    } catch (err) {
      setSubmissionStatus('error');
    }
  };

  return (
    <>
      {submissionStatus === 'initial' && <NewAddressInitial handleSubmit={handleSubmit} />}
      {submissionStatus === 'error' && <NewAddressError />}
      {submissionStatus === 'success' && <NewAddressSuccess />}
    </>
  );
}
