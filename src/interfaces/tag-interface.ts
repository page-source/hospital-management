export interface ITag {
  tagId: string;
  tagName: string;
  tagShortDescription: string;
  tagImageURL?: string;
  discountValue?: number;
  serviceNames: IServiceName[];
  discountPercentage?: number;
  updatedAtStr?: string;
}

interface IServiceName {
  serviceId: string;
  name: string;
}
