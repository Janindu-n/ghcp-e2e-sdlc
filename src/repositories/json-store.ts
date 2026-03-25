import * as fs from 'fs';
import * as path from 'path';

export class JsonRepository<T extends { id: string }> {
  private filePath: string;
  private data: T[];

  constructor(filePath: string) {
    this.filePath = filePath;
    this.data = this.loadData();
  }

  private loadData(): T[] {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  private saveData(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  findAll(filters?: Partial<T>): T[] {
    if (!filters) return [...this.data];
    return this.data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined) return true;
        return (item as Record<string, unknown>)[key] === value;
      });
    });
  }

  findById(id: string): T | undefined {
    return this.data.find(item => item.id === id);
  }

  create(item: T): T {
    this.data.push(item);
    this.saveData();
    return item;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    this.data[index] = { ...this.data[index], ...patch };
    this.saveData();
    return this.data[index];
  }

  delete(id: string): boolean {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    this.saveData();
    return true;
  }
}
