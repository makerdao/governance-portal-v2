import create from 'zustand';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import { Ballot } from '../types/ballot';
import { transactionsApi } from 'modules/web3/stores/transactions';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/pollComments';
import { fetchJson } from 'lib/fetchJson';
import { ethers } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { sign } from 'modules/web3/helpers/sign';
import { Web3Provider } from '@ethersproject/providers';

type Store = {
  ballot: Ballot;
  previousVotes: Ballot;
  comments: Partial<PollComment>[];
  setComments: (newComments: Partial<PollComment>[]) => void;
  updateComment: (comment: string, pollId: number) => void;
  txId: null | string;
  clearTx: () => void;
  addToBallot: (pollId: number, option: number | number[]) => void;
  removeFromBallot: (pollId: number) => void;
  updatePreviousVotes: () => void;
  clearBallot: () => void;
  submitBallot: (
    account: string,
    network: SupportedNetworks,
    govPollingContract: ethers.Contract,
    voteDelegateContract?: ethers.Contract,
    voteDelegateContractAddress?: string,
    voteProxyContractAddress?: string
  ) => Promise<void>;
  signComments: (account: string, provider: Web3Provider) => Promise<void>;
  signedMessage: string;
  rawMessage: string;
};

const [useBallotStore, ballotApi] = create<Store>((set, get) => ({
  ballot: {},
  previousVotes: {},
  txId: null,
  comments: [],
  signedMessage: '',
  rawMessage: '',

  setComments: (newComments: Partial<PollComment>[]) => {
    set({ comments: newComments, signedMessage: '', rawMessage: '' });
  },

  updateComment: (text: string, pollId: number) => {
    const comments = get().comments;
    const exist = comments.find(i => i.pollId === pollId);

    set(state => ({
      signedMessage: '',
      rawMessage: '',
      comments: exist
        ? state.comments.map(comment => {
            if (comment.pollId === pollId) {
              return {
                ...comment,
                comment: text
              };
            } else {
              return comment;
            }
          })
        : [
            ...state.comments,
            {
              comment: text,
              pollId
            }
          ]
    }));
  },

  clearTx: () => {
    set({ txId: null });
  },

  addToBallot: (pollId, option: number | number[]) => {
    set(state => ({ ballot: { ...state.ballot, [pollId]: { ...state.ballot[pollId], option } } }));
  },

  removeFromBallot: pollId => {
    set(state => ({ ballot: omit(state.ballot, pollId) }));
  },

  updatePreviousVotes: () => {
    const ballot = get().ballot;
    const previousVotes = get().previousVotes;
    set({
      previousVotes: {
        ...previousVotes,
        ...ballot
      }
    });
  },

  clearBallot: () => {
    set({ ballot: {} });
  },

  signComments: async (account: string, provider: Web3Provider) => {
    const comments = get().comments;

    // Sign message for commenting
    const rawMessage =
      comments.length > 1
        ? `I am leaving ${comments.length} comments for my votes.
  ${comments.map(comment => `- Poll ${comment.pollId}: ${comment.comment}.  `).join('\n')}
    `
        : `${comments[0].comment}`;

    const signedMessage = comments.length > 0 ? await sign(account, rawMessage, provider) : '';

    set({
      signedMessage,
      rawMessage
    });
  },

  submitBallot: async (
    account: string,
    network: SupportedNetworks,
    govPollingContract: ethers.Contract,
    voteDelegateContract?: ethers.Contract,
    voteDelegateContractAddress?: string,
    voteProxyContractAddress?: string
  ) => {
    const newBallot = {};
    const ballot = get().ballot;

    const pollIds: string[] = [];
    const pollOptions: string[] = [];

    Object.keys(ballot).forEach((key: string) => {
      if (!isNil(ballot[key].option)) {
        newBallot[key] = { ...ballot[key], submittedOption: ballot[key].option };
        pollIds.push(key);
        pollOptions.push(ballot[key].option);
      }
    });

    const comments = get().comments;
    const voteTxCreator = voteDelegateContract
      ? () => voteDelegateContract['votePoll(uint256[],uint256[])'](pollIds, pollOptions)
      : () => govPollingContract['vote(uint256[],uint256[])'](pollIds, pollOptions);

    const txId = await transactionsApi
      .getState()
      .track(voteTxCreator, account, `Voting on ${Object.keys(ballot).length} polls`, {
        pending: txHash => {
          // if comment included, add to comments db
          if (comments.length > 0) {
            const commentsRequest: PollsCommentsRequestBody = {
              voterAddress: account || '',
              delegateAddress: voteDelegateContract ? voteDelegateContractAddress : '',
              voteProxyAddress: voteProxyContractAddress ? voteProxyContractAddress : '',
              comments,
              rawMessage: get().rawMessage,
              signedMessage: get().signedMessage,
              txHash
            };

            fetchJson(`/api/comments/polling/add?network=${network}`, {
              method: 'POST',
              body: JSON.stringify(commentsRequest)
            })
              .then(() => {
                // console.log('comment successfully added');
                get().setComments([]);
              })
              .catch(() => {
                console.error('failed to add comment');
                get().setComments([]);
              });
          }
        },
        mined: txId => {
          get().updatePreviousVotes();
          get().clearBallot();
          transactionsApi.getState().setMessage(txId, `Voted on ${Object.keys(ballot).length} polls`);
        }
      });

    set({ ballot: newBallot, txId });
  }
}));

export default useBallotStore;
export { ballotApi };
