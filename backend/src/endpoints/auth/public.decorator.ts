//
// Copyright (c) 2024 IB Systems GmbH
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Lets a route through without a session.
 *
 * AuthGuard runs for every route, so this is the complete list of the
 * unauthenticated surface: `grep -rn "@Public()" src/` shows it. Only two
 * kinds of route qualify — those reached before a session exists (signing in,
 * refreshing, signing out) and those called by another machine rather than by
 * the browser.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
