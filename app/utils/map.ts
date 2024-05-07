import { ZodIssue } from "zod";

export const mapZodErrorsToRHFErrors = (issues: ZodIssue[]) => {
  return issues.reduce((acc, issue) => {
    acc[issue.path[0]] ??= { message: issue.message };
    return acc;
  }, {} as Record<string, { message: string }>);
};
