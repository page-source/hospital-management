import { ITag } from "./tag-interface";

export interface ITagsCategory {
  tagCategoryId: string;
  tagCategoryName: string;
  tagCategoryShortDescription: string;
  tagIconURL?: string;
  tagList?: ITag[];
  updatedAtStr?: string;
}
