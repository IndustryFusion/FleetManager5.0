export interface IcsField {
    name?: string;
    type?:
      | 'text'
      | 'number'
      | 'boolean'
      | 'date'
      | 'time'
      | 'datetime'
      | 'file'
      | 'image'
      | 'select';
    required?: boolean;
    unit?: 'mm' | 'kg' | 'm' | 's' | 'min' | 'h' | 'd' | '°C' | '°F' | '°K';
    description?: string;
    readonly?: boolean;
    visible?: boolean;
    contentMediaType?: string;
    contentEncoding?: string;
    enum?: string[];
    id?: string;
    $id?: string;
    placeholder?: string;
}