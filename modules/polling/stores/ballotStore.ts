import create from 'zustand';
import omit from 'lodash/omit';
import { Ballot } from '../types/ballot';
import { PollComment } from 'modules/comments/types/pollComments';
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
  }
}));

export default useBallotStore;
export { ballotApi };
