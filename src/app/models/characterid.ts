import { Episode } from "./episode";

export interface Characterid {

  id: number;
  age: number;
  birthdate: string;
  description: string;

  first_appearance_ep_id: number;
  first_appearance_sh_id: number;

  gender: string;
  name: string;
  occupation: string;
  portrait_path: string;
  status: string;

  phrases: string[];

  first_appearance_ep: Episode;
  first_appearance_sh: Episode;

}
