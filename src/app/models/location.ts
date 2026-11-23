import { Episode } from './episode';

export interface Location {
  id: number;
  name: string;
  image_path: string | null;
  town: string | null;
  use: string | null;
  /** Extra fields returned by the detail endpoint; absent in list results. */
  description?: string | null;
  first_appearance_ep_id?: number | null;
  first_appearance_sh_id?: number | null;
  first_appearance_ep?: Episode | null;
  first_appearance_sh?: Episode | null;
}
