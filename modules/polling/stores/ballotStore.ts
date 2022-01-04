import create from 'zustand';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import getMaker, { getNetwork, personalSign } from 'lib/maker';
import { Ballot } from '../types/ballot';
import { transactionsApi } from 'modules/web3/stores/transactions';
import { accountsApi } from 'modules/app/stores/accounts';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/pollComments';
import { fetchJson } from 'lib/fetchJson';

type Store = {
  ballot: Ballot;
  comments: Partial<PollComment>[];
  setComments: (newComments: Partial<PollComment>[]) => void;
  updateComment: (comment: string, pollId: number) => void;
  txId: null | string;
  clearTx: () => void;
  addToBallot: (pollId: number, option: number | number[]) => void;
  removeFromBallot: (pollId: number) => void;
  clearBallot: () => void;
  submitBallot: () => Promise<void>;
  signComments: () => Promise<void>;
  signedMessage: string;
  rawMessage: string;
};

const [useBallotStore] = create<Store>((set, get) => ({
  ballot: {},
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

  clearBallot: () => {
    set({ ballot: {} });
  },

  signComments: async () => {
    const comments = get().comments;

    // Sign message for commenting
    const rawMessage =
      comments.length > 1
        ? `I am leaving ${comments.length} comments for my votes.
  ${comments.map(comment => `- Poll ${comment.pollId}: ${comment.comment}.  `).join('\n')}
    `
        : `${comments[0].comment}`;

    const signedMessage = comments.length > 0 ? await personalSign(rawMessage) : '';

    set({
      signedMessage,
      rawMessage
    });
  },

  submitBallot: async () => {
    const newBallot = {};
    const maker = await getMaker();
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
    const account = accountsApi.getState().currentAccount;
    const voteDelegate = accountsApi.getState().voteDelegate;
    const voteProxy = account?.address ? accountsApi.getState().proxies[account?.address] : null;

    const voteTxCreator = voteDelegate
      ? () => voteDelegate.votePoll(pollIds, pollOptions)
      : () => maker.service('govPolling').vote(pollIds, pollOptions);

    const txId = await transactionsApi
      .getState()
      .track(voteTxCreator, `Voting on ${Object.keys(ballot).length} polls`, {
        pending: txHash => {
          // if comment included, add to comments db
          if (comments.length > 0) {
            const commentsRequest: PollsCommentsRequestBody = {
              voterAddress: account?.address || '',
              delegateAddress: voteDelegate ? voteDelegate.getVoteDelegateAddress() : '',
              voteProxyAddress: voteProxy ? voteProxy.getProxyAddress() : '',
              comments,
              rawMessage: get().rawMessage,
              signedMessage: get().signedMessage,
              txHash
            };

            fetchJson(`/api/comments/polling/add?network=${getNetwork()}`, {
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
          get().clearBallot();
          transactionsApi.getState().setMessage(txId, `Voted on ${Object.keys(ballot).length} polls`);
        }
      });

    set({ ballot: newBallot, txId });
  }
}));

export default useBallotStore;
