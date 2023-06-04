export interface IService {
  serviceId: string;
  name: string;
  shortDescription?: string;
  longDescription?: string;
  regularPrice?: number;
  locations: string[];
  tagIds: string[];
  createdAt: number;
  questions: IServiceQuestions[];
}

export interface IServiceQuestions {
  answer: string;
  questionId: string;
  questionType: "SINGLE_CHOICE" | "MULTI_CHOICE" | "FREE_TEXT";
  questionContent: string;
  possibleAnswers: string[];
}
