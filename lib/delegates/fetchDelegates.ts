import matter from 'gray-matter';
import { fetchPage } from 'lib/github';
import { Delegate, DelegateRepoInformation } from '../../types/delegate';
import { DelegateStatusEnum } from './constants';

const delegates: Delegate[] = [
  {
    id: 'a22bcd',
    name: 'Dai.js Test Account',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    owner: '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    description:
      'Actual vote delegate contract, deployed by dai.js test account 0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    picture: '',
    status: DelegateStatusEnum.active,
    lastVote: new Date(),
    contractExpireDate: new Date()
  },
  {
    id: 'a22bcd',
    name: 'John Mcaffee',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    owner: '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    description: 'Another profile',
    picture: 'https://i.pravatar.cc/300',
    status: DelegateStatusEnum.active,
    lastVote: new Date(),
    contractExpireDate: new Date()
  },
  {
    id: 'a22bcd',
    name: 'William Anon',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    owner: '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    description: 'Mr delegate',
    picture: 'https://i.pravatar.cc/300',
    status: DelegateStatusEnum.active,
    lastVote: new Date(),
    contractExpireDate: new Date()
  },
  {
    id: 'a22bcd',
    name: 'A person with a long name that may break the UI if not contemplated',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    owner: '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    description:
      'Actual vote delegate contract, deployed by dai.js test account 0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    picture: '',
    status: DelegateStatusEnum.active,
    lastVote: new Date(),
    contractExpireDate: new Date()
  },
  {
    id: 'a22bcd',
    name: 'Mr Unrecognized',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    owner: '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    description:
      'Actual vote delegate contract, deployed by dai.js test account 0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    picture: '',
    status: DelegateStatusEnum.unrecognized,
    lastVote: new Date(),
    contractExpireDate: new Date()
  },
  {
    id: 'a22bcd',
    name: 'Mr Unrecognized 2',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    owner: '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    description:
      'Actual vote delegate contract, deployed by dai.js test account 0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    picture: '',
    status: DelegateStatusEnum.unrecognized,
    lastVote: new Date(),
    contractExpireDate: new Date()
  },
  {
    id: 'a22bcd',
    name: 'Mr Expired',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    owner: '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    description:
      'Actual vote delegate contract, deployed by dai.js test account 0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    picture: '',
    status: DelegateStatusEnum.expired,
    lastVote: new Date(),
    contractExpireDate: new Date()
  }
];

export function fetchDelegate(address: string): Promise<Delegate | undefined> {
  return Promise.resolve(delegates.find(i => i.address === address));
}

export function fetchDelegates(): Promise<Delegate[]> {
  return Promise.resolve(delegates);
}


export async function fetchDelegatesGithub(): Promise<DelegateRepoInformation[]> {
  const owner = process.env.GITHUB_DELEGATES_OWNER || 'makerdao-dux';
  const repo =  process.env.GITHUB_DELEGATES_REPO || 'voting-delegates';
  const page = 'delegates';


  // Fetch all folders inside the delegates folder
  const folders = await fetchPage(owner, repo, page);
  
  // Get the information of all the delegates, filter errored ones
  const promises = folders.map(async (folder): Promise<DelegateRepoInformation | null> => {
    try {
      const folderContents = await fetchPage(owner, repo, folder.path);

      const readme = folderContents.find(item => item.name === 'README.md');

      // No readme found
      if (!readme) {
        return null;
      }

      const readmeDoc = await (await fetch(readme?.download_url)).text();

      const {
        content,
        data: {
          name,
          url
        }
      } = matter(readmeDoc);

      const picture = folderContents.find(item => item.name.indexOf('profile') !== -1);

      return {
        address: folder.name,
        name,
        picture: picture ? picture.download_url: '',
        externalUrl: url,
        description: content
      };

    } catch (e) {
      return null;
    }
  });

  const results = await Promise.all(promises);

  // Filter out negatives 
  return results.filter(i => !!i) as DelegateRepoInformation[];
} 