import type { IconKey, OccasionKey } from '../types';

export interface Occasion {
  label: string;
  icon: IconKey;
  opening: string;
  closing: string;
  /** Message ideas; the first one is filled in when the occasion is picked. */
  ideas: string[];
}

export const OCCASIONS: Record<OccasionKey, Occasion> = {
  birthday: {
    label: 'Birthday',
    icon: 'cake',
    opening: 'Dear Anna,',
    closing: 'Love,\nBen',
    ideas: [
      'Happy birthday! I hope your day is full of cake, sunshine and the people you love.',
      'Another year, another adventure. Have a wonderful birthday and a great year ahead!',
      'Happy birthday! Thank you for being such a good friend. Let’s celebrate soon.',
    ],
  },
  thanks: {
    label: 'Thank you',
    icon: 'flower',
    opening: 'Dear Anna,',
    closing: 'With thanks,\nBen',
    ideas: [
      'Thank you so much for your help. It meant more to me than you know.',
      'Thank you for the lovely evening. I really enjoyed it.',
      'A big thank you for the beautiful present. You made my day!',
    ],
  },
  congrats: {
    label: 'Congratulations',
    icon: 'star',
    opening: 'Dear Anna,',
    closing: 'Best wishes,\nBen',
    ideas: [
      'Congratulations on passing your final exams! All the best for what comes next.',
      'Congratulations on your well-earned success. I’m so proud of you!',
      'Congratulations on your new home! May it be full of happy moments.',
    ],
  },
  love: {
    label: 'Love',
    icon: 'heart',
    opening: 'My dear Anna,',
    closing: 'Yours,\nBen',
    ideas: [
      'Every day with you is my favourite day. I love you.',
      'Just a little note to say I’m thinking of you, always.',
      'Thank you for every smile, every adventure and every quiet evening.',
    ],
  },
  getwell: {
    label: 'Get well',
    icon: 'sun',
    opening: 'Dear Anna,',
    closing: 'Thinking of you,\nBen',
    ideas: [
      'Get well soon! Sending you sunshine and lots of good wishes.',
      'Rest up and take good care of yourself. We miss you!',
      'Wishing you a quick recovery and better days ahead.',
    ],
  },
  sympathy: {
    label: 'Sympathy',
    icon: 'leaf',
    opening: 'Dear Anna,',
    closing: 'With heartfelt sympathy,\nBen',
    ideas: [
      'I’m so sorry for your loss. My thoughts are with you and your family.',
      'Words can’t say enough. I’m here for you, whenever you need me.',
      'Remembering a wonderful person with you today, and holding you in my thoughts.',
    ],
  },
  hello: {
    label: 'Just because',
    icon: 'smile',
    opening: 'Hi Anna,',
    closing: 'Cheers,\nBen',
    ideas: [
      'No reason at all, just wanted to say hello and that I think you’re great.',
      'I saw this and thought of you. Hope you’re having a lovely week!',
      'It’s been too long! Let’s meet for coffee soon.',
    ],
  },
  blank: {
    label: 'Something else',
    icon: 'sparkle',
    opening: '',
    closing: '',
    ideas: [],
  },
};

export const OCCASION_ORDER: OccasionKey[] = ['birthday', 'thanks', 'congrats', 'love', 'getwell', 'sympathy', 'hello', 'blank'];
