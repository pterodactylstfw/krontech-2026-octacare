export interface Patient {
  id: string;
  userId: string;
  medicalRecordNumber: string;
  dateOfBirth: string;
  bloodType: string;
  allergies: string[];
  medicalHistorySummary?: string;
}
