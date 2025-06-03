export interface Description {
  type: string;
  content: string;
}

export interface ServiceOption {
  _id?: string;
  serviceDetailId: string;
  serviceOptionName: string;
  serviceOptionDuration: number;
  serviceOptionPrice: number;
}

export interface Translation {
  _id: string;
  serviceId: string;
  serviceName: string;
  serviceSubName: string;
  defaultServicePrice: number;
  serviceImage: string;
  serviceImages: string[];
  serviceDescription: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  serviceDescriptions: Description[];
  options?: ServiceOption[]
}

export interface ServiceResponse {
  _id: string;
  serviceTypeId: string;
  branchId: string;
  serviceName?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  translations: Translation[];
}
