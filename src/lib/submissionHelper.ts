import dbConnect from "@/lib/dbConnect";
import { Submissions } from "@/models/Submission";
import summarizeFile from "@/lib/geminiSummary";
import { evaluateTextWithRubric } from "@/lib/rubric";
import { Categories } from "@/models/Category";
export async function submissionHelper(submission: Submissions, category: Categories) {
  dbConnect();
  submission.content.summary = await summarizeFile(submission.content.data, submission.content.type);
  submission.save();
  const res = await evaluateTextWithRubric(category.description, category.evaluationParameters.join(", "), submission.content.summary);
  const scores = await JSON.parse(res as string);
  submission.evaluationScores = scores;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submission.aggregatedScore = scores.reduce((n: any, { score }: any) => n + score, 0) / scores.length;
  submission.save();
}
