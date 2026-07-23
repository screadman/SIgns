/**
 * Local ASL video assets.
 * Source: PopSign ASL v1.0 (Georgia Tech / NTID / DPAN), CC BY 4.0.
 * One representative clip per gloss extracted from the public test split.
 * https://signdata.cc.gatech.edu/
 */

export const CONVERSATION_VIDEOS = {
  hello: require('../assets/asl/conversation/hello.mp4'),
  goodbye: require('../assets/asl/conversation/bye.mp4'),
  'good-morning': require('../assets/asl/conversation/morning.mp4'),
  'thank-you': require('../assets/asl/conversation/thankyou.mp4'),
  please: require('../assets/asl/conversation/please.mp4'),
  yes: require('../assets/asl/conversation/yes.mp4'),
  no: require('../assets/asl/conversation/no.mp4'),
  'im-fine': require('../assets/asl/conversation/fine.mp4'),
} as const;

export const WH_QUESTION_VIDEOS = {
  where: require('../assets/asl/wh-questions/where.mp4'),
  who: require('../assets/asl/wh-questions/who.mp4'),
  why: require('../assets/asl/wh-questions/why.mp4'),
} as const;

export type ConversationVideoId = keyof typeof CONVERSATION_VIDEOS;
export type WhQuestionVideoId = keyof typeof WH_QUESTION_VIDEOS;
