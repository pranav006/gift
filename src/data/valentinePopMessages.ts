/**
 * Valentine's Day pop suggestion messages
 * For use as popup notifications or swipeable cards in the app.
 */

export const behaviourLovePraise = [
  "You always notice when I've had a long day and make it softer.",
  "The way you remember the little things I say — that's love in action.",
  "You don't fix me; you just stay. That's the kind of safe I needed.",
  "You make caring look easy. For you it really is.",
  "You're the one who checks in not because you have to, but because you want to.",
  "Your patience when I'm messy or stressed is the quietest form of love.",
  "You see the best in me even when I can't see it myself.",
  "You show up. Consistently. That's rarer than any grand gesture.",
  "The way you put others before yourself — you deserve someone who does the same for you. I try.",
  "You make ordinary days feel like they matter. That's your superpower.",
]

export const lateNightDriveMemories = [
  "Remember that drive when we didn't know where we were going and didn't care?",
  "Late-night drives with you hit different. The road, the music, us.",
  "Those nights we just drove and talked — some of my favourite memories.",
  "You in the passenger seat, city lights passing. Simple. Perfect.",
  "We've solved half our problems on empty roads after midnight.",
  "Every long drive with you feels like a tiny adventure we didn't plan.",
  "The best conversations we've had were in the car when the world was asleep.",
  "Driving with you at night is when I feel most us.",
  "No destination, just the two of us and the road. That's the vibe.",
  "I'll never get tired of late-night drives with you. Ever.",
]

export const cuteMemePlayfulLove = [
  "You're my favourite notification. No mute, no DND.",
  "Plot twist: I'm not lost, I just wanted more time with you in the car.",
  "You're the 'one more episode' of my life. I never want to stop.",
  "We're that couple that drives around at 2 AM for no reason. No regrets.",
  "You're the person I send the 'wyd' text to and actually care about the answer.",
  "Relationship goal: still wanting to sit in the car and talk after we've arrived.",
  "You're my favourite person to do nothing with. It hits different.",
  "I'd choose a boring night with you over a fun night without you. Facts.",
]

export const finalEmotionalClosing = [
  "I don't need a day to celebrate you. But I'll take every excuse to remind you that you're the best thing that happened to me.",
  "You're not just my person for today. You're my person for the messy days, the quiet ones, and every day in between.",
  "Thanks for being the one I want to call after a long drive, a bad day, or a good one. You're home.",
]

export type PopCategory = 'behaviour' | 'drive' | 'playful' | 'closing'

export const allMessages = {
  behaviour: behaviourLovePraise,
  drive: lateNightDriveMemories,
  playful: cuteMemePlayfulLove,
  closing: finalEmotionalClosing,
} as const
