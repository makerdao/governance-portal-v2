import { Delegate } from '../../types/delegate';

const delegates: Delegate[] = [
  {
    id: 'a22bcd',
    name: 'Dai.js Test Account',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    description:
      'Actual vote delegate contract, deployed by dai.js test account 0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    picture: ''
  },
  {
    id: 'a22bcd',
    name: 'John Mcaffee',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    description: 'Another profile',
    picture: 'https://i.pravatar.cc/300'
  },
  {
    id: 'a22bcd',
    name: 'William Anon',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    description: 'Mr delegate',
    picture: 'https://i.pravatar.cc/300'
  },
  {
    id: 'a22bcd',
    name: 'A person with a long name that may break the UI if not contemplated',
    address: '0x051aD7842f4259608957437c46926E0FA29b182D',
    description:
      'Actual vote delegate contract, deployed by dai.js test account 0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    picture: ''
  }
];


export function fetchDelegate(address: string): Promise<Delegate | undefined> {
  return Promise.resolve(delegates.find(i => i.address === address));
}

export function fetchDelegates(): Promise<Delegate[]> {
  return Promise.resolve(delegates);
}
