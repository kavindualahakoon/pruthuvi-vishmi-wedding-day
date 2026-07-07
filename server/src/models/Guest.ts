export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  guestCount: number;
  foodPreference?: string;
  specialNotes?: string;
  attending: boolean;
  message?: string;
  createdAt: string;
  updatedAt: string;
}
