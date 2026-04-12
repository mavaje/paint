
export class Meta {
    records: Record<string, string> = {
        title: 'Untitled',
        software: 'Paint',
    };

    get(key: string): undefined | string {
        return this.records[key];
    }

    set(key: string, value: undefined | string): void {
        if (value) {
            this.records[key] = value;
        } else {
            delete this.records[key];
        }
    }

    remove(key: string): void {
        delete this.records[key];
    }
}
