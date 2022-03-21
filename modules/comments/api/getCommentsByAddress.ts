import { connectToDatabase } from 'modules/db/helpers/connectToDatabase';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import invariant from 'tiny-invariant';
import { ExecutiveCommentsAPIResponseItem, PollCommentsAPIResponseItem } from '../types/comments';
import { PollCommentFromDB } from '../types/pollComments';
import { ExecutiveCommentFromDB } from '../types/executiveComment';

export async function getCommentsByAddress(
  address: string,
  network: SupportedNetworks
): Promise<{
  executive: ExecutiveCommentsAPIResponseItem[];
  polling: PollCommentsAPIResponseItem[];
}> {
  const { db, client } = await connectToDatabase();

  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collectionPolling = db.collection('pollingComments');
  const collectionExecutive = db.collection('executiveComments');

  // decending sort
  const pollCommentsFromDB: PollCommentFromDB[] = await collectionPolling
    .find({ voterAddress: address.toLowerCase(), network })
    .sort({ date: -1 })
    .toArray();

  const executiveCommentsFromDB: ExecutiveCommentFromDB[] = await collectionExecutive
    .find({ voterAddress: address.toLowerCase(), network })
    .sort({ date: -1 })
    .toArray();

  const addressInfo = await getAddressInfo(address, network);

  const polling: PollCommentsAPIResponseItem[] = pollCommentsFromDB.map(comment => {
    const { _id, ...rest } = comment;
    return {
      comment: rest,
      address: addressInfo
    };
  });

  const executive: ExecutiveCommentsAPIResponseItem[] = executiveCommentsFromDB.map(comment => {
    const { _id, ...rest } = comment;
    return {
      comment: rest,
      address: addressInfo
    };
  });

  return {
    executive,
    polling
  };
}
