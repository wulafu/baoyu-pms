import { run, get, all } from '../utils/dbHelper';
import { Property } from '../models/types';

export class PropertyService {
  async getAll(): Promise<Property[]> {
    const properties = await all<Property>('SELECT * FROM properties');
    return properties.map(p => ({
        ...p,
        facilities: p.facilities ? JSON.parse(p.facilities as unknown as string) : []
    }));
  }

  async getById(id: number): Promise<Property | undefined> {
    const property = await get<Property>('SELECT * FROM properties WHERE id = ?', [id]);
    if (property) {
        property.facilities = property.facilities ? JSON.parse(property.facilities as unknown as string) : [];
    }
    return property;
  }

  async create(property: Property): Promise<Property> {
    const result = await run(
      'INSERT INTO properties (user_id, name, address, description, facilities) VALUES (?, ?, ?, ?, ?)',
      [
        property.user_id,
        property.name,
        property.address,
        property.description,
        JSON.stringify(property.facilities || [])
      ]
    );
    const newProperty = await this.getById(result.id);
    if (!newProperty) throw new Error('Failed to create property');
    return newProperty;
  }

  async update(id: number, data: any): Promise<void> {
    await run(
      'UPDATE properties SET name = ?, address = ?, description = ?, phone = ? WHERE id = ?',
      [data.name, data.address, data.description, data.phone, id]
    );
  }
}
