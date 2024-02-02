import { IcsField } from "./../../../types/template-fields";
export interface TemplateDescriptionDto  {
    type: string;
    title: string;
    description: string;
    properties: IcsField[];
}