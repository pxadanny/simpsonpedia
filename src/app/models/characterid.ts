import { Episode } from './episode';

export interface Characterid {
  id: number;
  name: string;
  status: string;
  gender: string;
  age: number | null;
  birthdate: string | null;
  description: string | null;
  occupation: string | null;
  portrait_path: string | null;
  phrases: string[];
  first_appearance_ep_id: number | null;
  first_appearance_sh_id: number | null;
  first_appearance_ep: Episode | null;
  first_appearance_sh: Episode | null;
}
