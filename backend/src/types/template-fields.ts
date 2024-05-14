// 
// Copyright (c) 2024 IB Systems GmbH 
// 
// Licensed under the Apache License, Version 2.0 (the "License"); 
// you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at 
// 
//   http://www.apache.org/licenses/LICENSE-2.0 
// 
// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
// See the License for the specific language governing permissions and 
// limitations under the License. 
// 
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
      | 'select'
      | 'string'
      | 'object'
      | 'array';
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
    ifric_template_id?: string;
}