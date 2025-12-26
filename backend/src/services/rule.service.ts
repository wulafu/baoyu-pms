import { run, all } from '../utils/dbHelper';

export interface Rule {
  id?: number;
  property_id: number;
  name: string;
  type: 'smart_close' | 'price_weekend' | 'price_long_stay';
  config: any;
  is_active: boolean;
}

export class RuleService {
  async getAll(propertyId: number): Promise<Rule[]> {
    const rules = await all<any>('SELECT * FROM rules WHERE property_id = ?', [propertyId]);
    return rules.map(r => ({ ...r, config: JSON.parse(r.config), is_active: !!r.is_active }));
  }

  async create(rule: Rule) {
    const sql = `
      INSERT INTO rules (property_id, name, type, config, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      rule.property_id,
      rule.name,
      rule.type,
      JSON.stringify(rule.config),
      rule.is_active ? 1 : 0
    ];
    
    const result: any = await run(sql, params);
    return { id: result.id, ...rule };
  }

  async toggle(id: number, isActive: boolean) {
    await run('UPDATE rules SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  }
}
