export interface GuestPhoto {
  id: string;
  url: string;
  originalName: string;
  uploaderName?: string;
  approved: boolean;
  createdAt: string;
}
