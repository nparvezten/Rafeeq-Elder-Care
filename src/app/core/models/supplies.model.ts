export interface CareSupply {
  id: string;
  name: string;
  category: 'diapers' | 'underpads' | 'hygiene' | 'wound_skin' | 'feeding' | 'general';
  quantity: number;
  unit: string;
  threshold: number;
  brand?: string;
  notes?: string;
  updated_at?: string;
  created_at?: string;
  created_by?: string;
}

export interface EquipmentRental {
  id: string;
  equipment_name: string;
  vendor_name: string;
  vendor_phone: string;
  monthly_rent: number;
  deposit_amount: number;
  start_date: string;
  renewal_due_date: string;
  status: 'active' | 'returned' | 'maintenance';
  notes?: string;
  created_at?: string;
  created_by?: string;
}
