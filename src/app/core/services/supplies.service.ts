import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CareSupply, EquipmentRental } from '../models/supplies.model';

const INITIAL_SUPPLIES: CareSupply[] = [
  {
    id: 'sup-1',
    name: 'Adult Diapers (Large / XL)',
    category: 'diapers',
    quantity: 6,
    unit: 'pieces',
    threshold: 10,
    brand: 'Friends Easy Adult Diapers',
    notes: 'Change 3-4 times daily; order a 30-pack box soon.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'sup-2',
    name: 'Disposable Underpads (Bed Sheets)',
    category: 'underpads',
    quantity: 4,
    unit: 'pads',
    threshold: 8,
    brand: 'Dignity Matte Underpads 60x90cm',
    notes: 'Placed over air mattress sheet to keep bed dry.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'sup-3',
    name: 'Moist Bed Bath Wipes',
    category: 'hygiene',
    quantity: 18,
    unit: 'wipes',
    threshold: 15,
    brand: 'Clensta / Care Wipes',
    notes: 'Chlorhexidine / Aloe Vera skin wipes for daily refreshment.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'sup-4',
    name: 'Nitrile Examination Gloves (Box)',
    category: 'hygiene',
    quantity: 35,
    unit: 'pairs',
    threshold: 15,
    brand: 'Romsons Nitrile Medium',
    notes: 'For attendant use during sponge bath and hygiene routines.',
    updated_at: new Date().toISOString()
  },
  {
    id: 'sup-5',
    name: 'Skin Barrier Cream / Moisturiser',
    category: 'wound_skin',
    quantity: 2,
    unit: 'tubes',
    threshold: 1,
    brand: 'Zinc Oxide / Sudocrem',
    notes: 'Apply after every change to prevent moisture rash.',
    updated_at: new Date().toISOString()
  }
];

const INITIAL_EQUIPMENT: EquipmentRental[] = [
  {
    id: 'eq-1',
    equipment_name: 'Motorized Alpha Air Mattress (Ripple Bed)',
    vendor_name: 'City Med-Equip Solutions',
    vendor_phone: '+91 98200 11223',
    monthly_rent: 1800,
    deposit_amount: 3000,
    start_date: '2026-08-25',
    renewal_due_date: '2026-09-25',
    status: 'active',
    notes: 'Anti-decubitus alternating air pump bed. Vendor provides free replacement if pump fails.'
  },
  {
    id: 'eq-2',
    equipment_name: 'Semi-Fowler Hospital Bed with Side Rails',
    vendor_name: 'LifeCare Rentals & Supplies',
    vendor_phone: '+91 98111 44556',
    monthly_rent: 3500,
    deposit_amount: 5000,
    start_date: '2026-08-26',
    renewal_due_date: '2026-09-26',
    status: 'active',
    notes: 'Back-rest elevation crank helps with feeding and breathing comfort.'
  },
  {
    id: 'eq-3',
    equipment_name: 'Folding Commode Wheelchair',
    vendor_name: 'LifeCare Rentals & Supplies',
    vendor_phone: '+91 98111 44556',
    monthly_rent: 1200,
    deposit_amount: 2000,
    start_date: '2026-08-28',
    renewal_due_date: '2026-09-28',
    status: 'active',
    notes: 'Used for moving to living room window and bathroom.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class SuppliesService {
  private supabaseService = inject(SupabaseService);

  readonly supplies = signal<CareSupply[]>(INITIAL_SUPPLIES);
  readonly equipment = signal<EquipmentRental[]>(INITIAL_EQUIPMENT);
  readonly isLoading = signal<boolean>(false);

  readonly lowStockSupplies = computed(() => {
    return this.supplies().filter(s => s.quantity <= s.threshold);
  });

  readonly activeRentals = computed(() => {
    return this.equipment().filter(e => e.status === 'active');
  });

  readonly totalMonthlyRent = computed(() => {
    return this.activeRentals().reduce((sum, e) => sum + (e.monthly_rent || 0), 0);
  });

  constructor() {
    this.loadData();
  }

  async loadData() {
    const supabase = this.supabaseService.supabase;
    if (!supabase) return;

    this.isLoading.set(true);
    try {
      const [suppliesRes, equipRes] = await Promise.all([
        supabase.from('care_supplies').select('*').order('name', { ascending: true }),
        supabase.from('equipment_rentals').select('*').order('renewal_due_date', { ascending: true })
      ]);

      if (!suppliesRes.error && suppliesRes.data && suppliesRes.data.length > 0) {
        this.supplies.set(suppliesRes.data as CareSupply[]);
      }
      if (!equipRes.error && equipRes.data && equipRes.data.length > 0) {
        this.equipment.set(equipRes.data as EquipmentRental[]);
      }
    } catch (err) {
      console.warn('Error loading supplies from Supabase, using fallback state:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateStock(supplyId: string, delta: number) {
    const item = this.supplies().find(s => s.id === supplyId);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + delta);
    const nowIso = new Date().toISOString();

    this.supplies.update(curr =>
      curr.map(s => s.id === supplyId ? { ...s, quantity: newQty, updated_at: nowIso } : s)
    );

    const supabase = this.supabaseService.supabase;
    if (supabase) {
      try {
        await supabase
          .from('care_supplies')
          .update({ quantity: newQty, updated_at: nowIso })
          .eq('id', supplyId);
      } catch (err) {
        console.warn('Supabase stock update error:', err);
      }
    }
  }

  async addSupply(supply: Omit<CareSupply, 'id' | 'updated_at' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();
    const nowIso = new Date().toISOString();

    const newRecord: CareSupply = {
      ...supply,
      id: 'sup-' + Date.now(),
      updated_at: nowIso,
      created_at: nowIso,
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('care_supplies')
          .insert([{
            ...supply,
            updated_at: nowIso,
            created_by: user?.id
          }])
          .select();

        if (!error && data && data.length > 0) {
          this.supplies.update(curr => [...curr, data[0] as CareSupply]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase supply insert error:', err);
      }
    }

    this.supplies.update(curr => [...curr, newRecord]);
    return { error: null };
  }

  async addEquipment(equip: Omit<EquipmentRental, 'id' | 'created_at'>): Promise<{ error: Error | null }> {
    const supabase = this.supabaseService.supabase;
    const user = this.supabaseService.currentUser();

    const newRecord: EquipmentRental = {
      ...equip,
      id: 'eq-' + Date.now(),
      created_at: new Date().toISOString(),
      created_by: user?.id
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('equipment_rentals')
          .insert([{
            ...equip,
            created_by: user?.id
          }])
          .select();

        if (!error && data && data.length > 0) {
          this.equipment.update(curr => [...curr, data[0] as EquipmentRental]);
          return { error: null };
        }
      } catch (err) {
        console.warn('Supabase equipment insert error:', err);
      }
    }

    this.equipment.update(curr => [...curr, newRecord]);
    return { error: null };
  }
}
